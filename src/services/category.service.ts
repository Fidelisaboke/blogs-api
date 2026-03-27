import { type InferInsertModel, type InferSelectModel, eq, count } from "drizzle-orm";
import { BaseService } from "./base.service";
import { categories } from "@/db/schema";
import { db } from "@/db";
import { AppError } from "@/lib/errors";

export type CreateCategory = InferInsertModel<typeof categories>;
export type Category = InferSelectModel<typeof categories>;
export type UpdateCategory = Partial<Omit<Category, "id">>;

export class CategoryService extends BaseService {
  async insertCategory(data: CreateCategory): Promise<Category> {
    const [insertedCategory] = await db.insert(categories).values(data).returning();
    if (!insertedCategory) throw new AppError("Failed to create category", 500);
    return insertedCategory;
  }

  async getCategories(page: number = 1, pageSize: number = 10) {
    const { limit, offset, page: safePage } = this.getPaginationParams(page, pageSize);
    const dataQuery = db.query.categories.findMany({
      limit: limit,
      offset: offset,
    });

    const countQuery = db
      .select({ total: count() })
      .from(categories)
      .then(([result]) => result ?? { total: 0 });

    const { data: categoriesData, ...result } = await this.paginate(
      dataQuery,
      countQuery,
      safePage,
      limit,
    );

    return {
      ...result,
      categories: categoriesData,
    };
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return await db.query.categories.findFirst({
      where: (c, { eq }) => eq(c.id, id),
    });
  }

  async updateCategory(id: number, data: UpdateCategory): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    if (!updatedCategory) throw new AppError("Category not found", 404);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    if (result.length === 0) throw new AppError("Category not found", 404);
  }
}
