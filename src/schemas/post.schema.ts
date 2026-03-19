import {z} from "zod";

export const createPostSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
});

export const updatePostSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    content: z.string().min(1, "Content is required").optional(),
    published: z.boolean().optional(),
}).refine((data) => Object.values(data).some(value => value !== undefined), {
    message: "You must provide at least one field to update"
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
