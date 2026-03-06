import { posts, users } from "@/db/schema"
import { type InferInsertModel, type InferSelectModel, eq, desc, count } from "drizzle-orm";
import { db } from "@/db"
import { AppError } from "@/lib/errors";
import { BaseService } from "./base.service";

export type CreatePost = InferInsertModel<typeof posts>;
export type Post = InferSelectModel<typeof posts>;
export type UpdatePost = Partial<CreatePost>

export class PostService extends BaseService {
    async insertPost(data: CreatePost) {
        // Check if author exists
        const [author] = await db.select().from(users).where(eq(users.id, data.authorId));
        if (!author) throw new AppError("Author not found", 404);

        // Insert post
        const [post] = await db.insert(posts).values(data).returning();
        return post;
    }

    async getPosts(page: number = 1, pageSize: number = 10) {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        const offset = (page - 1) * pageSize;

        const dataQuery = db
            .select()
            .from(posts)
            .innerJoin(users, eq(posts.authorId, users.id))
            .orderBy(desc(posts.createdAt))
            .offset(offset)
            .limit(pageSize);

        const countQuery = db
            .select({ total: count() })
            .from(posts)
            .innerJoin(users, eq(posts.authorId, users.id))
            .then(([result]) => result ?? { total: 0 });

        return this.paginate(dataQuery, countQuery, page, pageSize);
    }

    async getPostById(id: number): Promise<Post | undefined> {
        const [post] = await db.select().from(posts).where(eq(posts.id, id));
        if (!post) throw new AppError("Post not found", 404);
        return post;
    }

    async updatePost(id: number, data: UpdatePost): Promise<Post | undefined> {
        const [post] = await db.update(posts).set(data).where(eq(posts.id, id)).returning();
        if (!post) throw new AppError("Post not found", 404);
        return post;
    }

    async deletePost(id: number) {
        const result = await db.delete(posts).where(eq(posts.id, id)).returning();
        if (result.length === 0) throw new AppError("Post not found", 404);
    }
}