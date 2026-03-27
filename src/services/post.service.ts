import { posts, users, tags, tagsToPosts } from "@/db/schema";
import { type InferInsertModel, type InferSelectModel, eq, count } from "drizzle-orm";
import { db } from "@/db";
import { AppError } from "@/lib/errors";
import { BaseService } from "./base.service";

export type CreatePost = InferInsertModel<typeof posts>;
export type Post = InferSelectModel<typeof posts>;
export type UpdatePost = Partial<CreatePost>;

export class PostService extends BaseService {
  private transformPostWithTags(postWithRelations: any) {
    if (!postWithRelations) return null;

    const { tagsToPosts, ...post } = postWithRelations;
    return {
      ...post,
      tags: tagsToPosts?.map((tp: any) => tp.tag) ?? [],
    };
  }

  async insertPost(data: CreatePost) {
    // Check if author exists
    const [author] = await db.select().from(users).where(eq(users.id, data.authorId));
    if (!author) throw new AppError("Author not found", 404);

    // Insert post
    const [post] = await db.insert(posts).values(data).returning();
    return post;
  }

  async createPostWithTags(data: CreatePost, tagNames?: string[]) {
    return await db.transaction(async (tx) => {
      // Check if category exists
      if (!data.categoryId) throw new AppError("Category ID is required", 400);
      const category = await tx.query.categories.findFirst({
        where: (c, { eq }) => eq(c.id, data.categoryId!),
      });
      if (!category) throw new AppError("Category not found", 404);

      // Create post
      const [insertedPost] = await tx.insert(posts).values(data).returning();
      if (!insertedPost) throw new AppError("Failed to create post", 500);

      // Add tags for the post
      if (tagNames && tagNames.length > 0) {
        // Insert tags, skipping duplicates
        const normalizedTags = [...new Set(tagNames.map((name) => name.toLowerCase()))];
        await tx
          .insert(tags)
          .values(normalizedTags.map((name) => ({ name })))
          .onConflictDoNothing();

        const dbTags = await tx.query.tags.findMany({
          where: (t, { inArray }) => inArray(t.name, normalizedTags),
        });

        // Link tags with the junction table
        await tx.insert(tagsToPosts).values(
          dbTags.map((tag) => ({
            postId: insertedPost.id,
            tagId: tag.id,
          })),
        );
      }

      // Get the new post with tags, author, and category
      const postWithRelations = await tx.query.posts.findFirst({
        where: (p, { eq }) => eq(p.id, insertedPost.id),
        with: {
          category: true,
          author: true,
          tagsToPosts: {
            with: {
              tag: true,
            },
          },
        },
      });
      if (!postWithRelations) throw new AppError("Post not found", 404);
      return this.transformPostWithTags(postWithRelations);
    });
  }

  async getPosts(organizationId?: string | null, page: number = 1, pageSize: number = 10) {
    const { limit, offset, page: safePage } = this.getPaginationParams(page, pageSize);

    const dataQuery = db.query.posts.findMany({
      where: (posts, { eq }) => {
        return organizationId
          ? eq(posts.organizationId, organizationId)
          : eq(posts.published, true);
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      limit: limit,
      offset: offset,
      with: {
        category: true,
        author: true,
        tagsToPosts: {
          with: {
            tag: true,
          },
        },
      },
    });

    const countQuery = db
      .select({ total: count() })
      .from(posts)
      .where(organizationId ? eq(posts.organizationId, organizationId) : eq(posts.published, true))
      .then(([result]) => result ?? { total: 0 });

    // Get the pagination result
    const { data, ...result } = await this.paginate(dataQuery, countQuery, safePage, limit);

    // Flatten tagsToPosts array to an array of tags
    const postsData = data.map((item) => {
      return this.transformPostWithTags(item);
    });

    return {
      ...result,
      posts: postsData,
    };
  }

  async getPostById(id: number, organizationId?: string | null) {
    const postWithRelations = await db.query.posts.findFirst({
      where: (posts, { eq, and }) => {
        const conditions = [eq(posts.id, id)];

        if (organizationId) {
          conditions.push(eq(posts.organizationId, organizationId));
        } else {
          conditions.push(eq(posts.published, true));
        }

        return and(...conditions);
      },
      with: {
        category: true,
        author: true,
        tagsToPosts: {
          with: {
            tag: true,
          },
        },
      },
    });
    if (!postWithRelations) throw new AppError("Post not found", 404);
    return this.transformPostWithTags(postWithRelations);
  }

  async updatePost(id: number, data: UpdatePost): Promise<Post> {
    const [post] = await db.update(posts).set(data).where(eq(posts.id, id)).returning();
    if (!post) throw new AppError("Post not found", 404);
    return post;
  }

  async updatePostWithTags(id: number, data: UpdatePost, tagNames?: string[]) {
    return await db.transaction(async (tx) => {
      // Check if category exists if provided
      if (data.categoryId) {
        const category = await tx.query.categories.findFirst({
          where: (c, { eq }) => eq(c.id, data.categoryId!),
        });

        if (!category) {
          throw new AppError(`Category with ID ${data.categoryId} not found`, 404);
        }
      }

      // Update the post
      const [updatedPost] = await tx.update(posts).set(data).where(eq(posts.id, id)).returning();
      if (!updatedPost) throw new AppError("Post not found", 404);

      // Handle tags
      if (tagNames) {
        await tx.delete(tagsToPosts).where(eq(tagsToPosts.postId, id));

        if (tagNames.length > 0) {
          const normalizedNames = [...new Set(tagNames.map((n) => n.toLowerCase()))];

          // Ensure tags exist in the tags table
          await tx
            .insert(tags)
            .values(normalizedNames.map((name) => ({ name })))
            .onConflictDoNothing();

          // Get all IDs for the provided tag names
          const dbTags = await tx.query.tags.findMany({
            where: (t, { inArray }) => inArray(t.name, normalizedNames),
          });

          // Re-insert new relations
          await tx.insert(tagsToPosts).values(
            dbTags.map((tag) => ({
              postId: id,
              tagId: tag.id,
            })),
          );
        }
      }

      // Get the new post with tags, author, and category
      const postWithRelations = await tx.query.posts.findFirst({
        where: (p, { eq }) => eq(p.id, updatedPost.id),
        with: {
          category: true,
          author: true,
          tagsToPosts: {
            with: {
              tag: true,
            },
          },
        },
      });
      if (!postWithRelations) throw new AppError("Post not found", 404);
      return this.transformPostWithTags(postWithRelations);
    });
  }

  async deletePost(id: number) {
    const result = await db.delete(posts).where(eq(posts.id, id)).returning();
    if (result.length === 0) throw new AppError("Post not found", 404);
  }
}
