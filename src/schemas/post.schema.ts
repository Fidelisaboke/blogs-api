import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  published: z.boolean().optional().default(true),
  categoryId: z.number().min(1, "Category ID is required"),
  image: z.string().optional(),
  tags: z.array(z.string().min(1, "Tag cannot be empty")).optional(),
});

export const updatePostSchema = createPostSchema
  .omit({ published: true })
  .extend({ published: z.boolean().optional() })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { error: "At least one field must be provided" });

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
