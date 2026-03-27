import { z } from "zod";

export const createCommentSchema = z.object({
  parentId: z.number().min(1, "Parent ID is required").optional(),
  content: z
    .string()
    .min(1, "Content is required")
    .max(800, "Content must contain at most 800 characters"),
});

export const updateCommentSchema = createCommentSchema.omit({ parentId: true }).partial();

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
