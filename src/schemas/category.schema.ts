import { z } from "zod";

export const createCategory = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must not exceed 50 characters"),
  slug: z
    .string()
    .min(1, "Category slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
});

export const updateCategory = createCategory.partial();
