import { CommentController } from "@/controllers/comment.controller";
import { requireAuth, canManageComment } from "@/middleware/auth";
import { validateRequest } from "@/middleware/validator";
import { Router } from "express";
import { createCommentSchema, updateCommentSchema } from "@/schemas/comment.schema";

export const router: Router = Router();

const commentController = new CommentController();

// Public
router.get("/posts/:postId/comments", commentController.index);
router.get("/posts/:postId/comments/:id", commentController.show);

// Protected
router.post(
  "/posts/:postId/comments",
  requireAuth,
  validateRequest(createCommentSchema),
  commentController.create,
);
router.patch(
  "/comments/:id",
  requireAuth,
  canManageComment,
  validateRequest(updateCommentSchema),
  commentController.update,
);
router.delete("/comments/:id", requireAuth, canManageComment, commentController.destroy);
