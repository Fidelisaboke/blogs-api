import { eq, type InferInsertModel, type InferSelectModel, count, isNull, and } from "drizzle-orm";
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
        const conditions = [eq(p.id, postId)];

        // Post must be published OR belong to the user's active organization
        const visibilityConditions = [eq(p.published, true)];
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
    postId: number,
    page: number = 1,
    pageSize: number = 10,
    activeOrganizationId?: string | null,
  ) {
    const { limit, offset, page: safePage } = this.getPaginationParams(page, pageSize);

    // Check if post exists and is accessible
    const post = await db.query.posts.findFirst({
      where: (p, { eq, and, or }) => {
        const conditions = [eq(p.id, postId)];

        // Post must be published OR belong to the user's active organization
        const visibilityConditions = [eq(p.published, true)];
        if (activeOrganizationId) {
          visibilityConditions.push(eq(p.organizationId, activeOrganizationId));
        }

        const orCondition = or(...(visibilityConditions as [any, ...any[]]));
        if (orCondition) conditions.push(orCondition);
        return and(...conditions);
      },
    });

    if (!post) throw new AppError("Post not found", 404);

    // Two-step fetch to get root comments and their replies
    const dataQuery = (async () => {
      // Get root comments
      const roots = await db.query.comments.findMany({
        where: (c, { eq, and, isNull }) => {
          return and(eq(c.postId, postId), isNull(c.parentId));
        },
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
      });

      if (roots.length === 0) return [];

      // Get the Ids of the root comments
      const rootIds = roots.map((c) => c.id);

      // Get all replies for the root comments
      const replies = await db.query.comments.findMany({
        where: (c, { eq, and, inArray }) => {
          return and(eq(c.postId, postId), inArray(c.parentId, rootIds));
        },
        with: {
          author: true,
          commentLikes: {
            with: {
              user: true,
            },
          },
        },
      });

      return [...roots, ...replies];
    })();

    const countQuery = db
      .select({ total: count() })
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .where(and(eq(comments.postId, postId), isNull(comments.parentId)))
      .then(([result]) => result ?? { total: 0 });

    const { data, ...result } = await this.paginate(dataQuery, countQuery, safePage, limit);

    // Build a map of comments with empty replies array
    const commentsMap = new Map<number, Comment>(
      data.map((comment) => [comment.id, { ...comment, replies: [] }]),
    );

    // Link replies to root comments
    for (const comment of commentsMap.values()) {
      if (comment.parentId) {
        const parent = commentsMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(comment);
        }
      }
    }

    // Return top-level comments with replies
    return {
      ...result,
      comments: Array.from(commentsMap.values()).filter((c) => c.parentId === null),
    };
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
