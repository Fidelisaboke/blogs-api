import {
  eq,
  type InferInsertModel,
  type InferSelectModel,
  count,
  isNull,
  and,
  inArray,
  type SQL,
} from "drizzle-orm";
import { BaseService } from "./base.service";
import { db } from "@/db";
import { users, comments, commentLikes, type User, type CommentLike } from "@/db/schema";
import { AppError } from "@/lib/errors";

export type CreateComment = InferInsertModel<typeof comments>;
type BaseComment = InferSelectModel<typeof comments> & {
  author: User;
  commentLikes?: CommentLike[];
};
export type Comment = BaseComment & { replies: Comment[] };
export type UpdateComment = Partial<CreateComment>;

export class CommentService extends BaseService {
  async insertComment(postId: number, data: CreateComment, activeOrganizationId?: string | null) {
    // Check if author exists
    const author = await db.query.users.findFirst({ where: eq(users.id, data.authorId) });
    if (!author) throw new AppError("User not found", 404);

    // Check if post exists and is accessible
    const post = await db.query.posts.findFirst({
      where: (p, { eq, and, or }) => {
        const conditions: SQL[] = [eq(p.id, postId)];

        // Post must be published OR belong to the user's active organization
        const visibilityConditions: SQL[] = [eq(p.published, true)];
        if (activeOrganizationId) {
          visibilityConditions.push(eq(p.organizationId, activeOrganizationId));
        }

        const orCondition = or(...(visibilityConditions as [any, ...any[]]));
        if (orCondition) conditions.push(orCondition);
        return and(...conditions);
      },
    });

    if (!post) throw new AppError("Post not found", 404);

    // Check if parent comment exists if parent ID is provided
    if (data.parentId) {
      const parentComment = await db.query.comments.findFirst({
        where: eq(comments.id, data.parentId),
      });
      if (!parentComment) throw new AppError("Parent comment does not exist", 404);
    }

    // Insert comment
    const [comment] = await db
      .insert(comments)
      .values({ ...data, postId: postId })
      .returning();
    return comment;
  }

  async getComments(
    filters: { postId?: number; authorId?: string },
    page: number = 1,
    pageSize: number = 10,
    activeOrganizationId?: string | null,
  ) {
    const { limit, offset, page: safePage } = this.getPaginationParams(page, pageSize);

    // Build query conditions
    const conditions: SQL[] = [];
    if (filters.postId) {
      conditions.push(eq(comments.postId, filters.postId));
    }
    if (filters.authorId) {
      conditions.push(eq(comments.authorId, filters.authorId));
    }

    // Visibility condition: Published posts OR user's organization posts
    const allowedPosts = await db.query.posts.findMany({
      columns: { id: true },
      where: (p, { eq, or }) => {
        const visibility = [eq(p.published, true)];
        if (activeOrganizationId) {
          visibility.push(eq(p.organizationId, activeOrganizationId));
        }
        return or(...visibility);
      },
    });

    const allowedPostIds = allowedPosts.map((p) => p.id);

    if (allowedPostIds.length === 0) {
      return { comments: [], total: 0, page: safePage, limit, totalPages: 0 };
    }

    // Filter by allowed posts
    conditions.push(inArray(comments.postId, allowedPostIds));

    // Fetch root comments (paginated)
    const roots = await db.query.comments.findMany({
      where: (c, { and, isNull }) => and(isNull(c.parentId), ...conditions),
      with: {
        author: true,
        commentLikes: {
          with: {
            user: true,
          },
        },
      },
      limit: limit,
      offset: offset,
      orderBy: (c, { desc }) => [desc(c.createdAt)],
    });

    if (roots.length === 0) {
      return { comments: [], total: 0, page: safePage, limit, totalPages: 0 };
    }

    // Fetch all descendants for these root comments' posts
    const rootPostIds = [...new Set(roots.map((r) => r.postId))];
    const descendants = await db.query.comments.findMany({
      where: (c, { and, isNotNull, inArray }) =>
        and(isNotNull(c.parentId), inArray(c.postId, rootPostIds)),
      with: {
        author: true,
        commentLikes: {
          with: {
            user: true,
          },
        },
      },
    });

    const allComments = [...roots, ...descendants];
    const tree = this.buildTree(allComments as any);
    const rootIds = roots.map((r) => r.id);

    const [countResult] = await db
      .select({ total: count() })
      .from(comments)
      .where(and(isNull(comments.parentId), ...conditions));

    const total = countResult?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      comments: tree.filter((t) => rootIds.includes(t.id)),
      total,
      page: safePage,
      limit,
      totalPages,
    };
  }

  private buildTree(allComments: BaseComment[], maxDepth: number = 5): Comment[] {
    const map = new Map<number, Comment>();
    const roots: Comment[] = [];

    // First pass: Create all comment objects
    for (const c of allComments) {
      if (!map.has(c.id)) {
        map.set(c.id, { ...c, replies: [] });
      }
    }

    // Second pass: Assign to parents and track depth
    for (const c of map.values()) {
      if (!c.parentId) {
        roots.push(c);
      } else {
        const parent = map.get(c.parentId);
        if (parent) {
          // Calculate current depth
          let depth = 1;
          let current = parent;
          while (current.parentId && depth < maxDepth) {
            const next = map.get(current.parentId);
            if (!next) break;
            current = next;
            depth++;
          }

          if (depth < maxDepth) {
            parent.replies.push(c);
          }
        }
      }
    }

    return roots;
  }

  async getCommentById(id: number, activeOrganizationId?: string | null) {
    const commentWithRelations = await db.query.comments.findFirst({
      where: (comment, { eq }) => eq(comment.id, id),
      with: {
        author: true,
        post: true,
        commentLikes: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!commentWithRelations) throw new AppError("Comment not found", 404);

    // Check post visibility
    const isVisible =
      commentWithRelations.post.published ||
      (activeOrganizationId && commentWithRelations.post.organizationId === activeOrganizationId);

    if (!isVisible) throw new AppError("Post not found", 404);

    const { post: _post, ...comment } = commentWithRelations;
    return { ...comment, replies: [] };
  }

  async likeComment(id: number, userId: string) {
    return await db.transaction(async (tx) => {
      // Check if comment exists
      const comment = await tx.query.comments.findFirst({
        where: eq(comments.id, id),
        with: {
          commentLikes: true,
        },
      });

      if (!comment) throw new AppError("Comment not found", 404);

      // Toggle comment like
      const isLiked = comment.commentLikes.some((like) => like.userId === userId);
      if (isLiked) {
        await tx.delete(commentLikes).where(eq(commentLikes.commentId, id));
      } else {
        await tx.insert(commentLikes).values({ commentId: id, userId });
      }

      // Get the updated comment
      const updatedComment = await tx.query.comments.findFirst({
        where: eq(comments.id, id),
        with: {
          commentLikes: {
            with: {
              user: true,
            },
          },
        },
      });

      if (!updatedComment) throw new AppError("Comment not found", 404);
      return updatedComment;
    });
  }

  async updateComment(id: number, data: UpdateComment) {
    const [comment] = await db.update(comments).set(data).where(eq(comments.id, id)).returning();
    if (!comment) throw new AppError("Comment not found", 404);
    return comment;
  }

  async deleteComment(id: number) {
    const result = await db.delete(comments).where(eq(comments.id, id)).returning();
    if (result.length === 0) throw new AppError("Comment not found", 404);
  }
}
