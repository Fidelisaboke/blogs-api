import { type InferInsertModel, type InferSelectModel, eq, count, ilike, or } from "drizzle-orm";
import { BaseService } from "./base.service";
import { categories } from "@/db/schema";
import { db } from "@/db";
import { AppError } from "@/lib/errors";

export type CreateCategory = InferInsertModel<typeof categories>;
export type Category = InferSelectModel<typeof categories>;
export type UpdateCategory = Partial<Omit<Category, "id">>;

export class CategoryService extends BaseService {
  async insertCategory(data: CreateCategory): Promise<Category> {
    // Ensure category name or slug is unique
    const existingCategory = await db.query.categories.findFirst({
      where: (c, { eq, or }) => or(eq(c.name, data.name), eq(c.slug, data.slug)),
    });
    if (existingCategory) throw new AppError("Category already exists", 400);

    const [insertedCategory] = await db.insert(categories).values(data).returning();
    if (!insertedCategory) throw new AppError("Failed to create category", 500);
    return insertedCategory;
  }

  async getCategories(page: number = 1, pageSize: number = 10, q?: string) {
    const { limit, offset, page: safePage } = this.getPaginationParams(page, pageSize);

    const whereClause = q
      ? or(ilike(categories.name, `%${q}%`), ilike(categories.slug, `%${q}%`))
      : undefined;

    const dataQuery = db.query.categories.findMany({
      where: whereClause,
      limit: limit,
      offset: offset,
    });

    const countQuery = db
      .select({ total: count() })
      .from(categories)
      .where(whereClause)
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
