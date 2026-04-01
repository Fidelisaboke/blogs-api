import { CommentController } from "@/controllers/comment.controller";
import { requireAuth, canManageComment, optionalAuth } from "@/middleware/auth";
import { validateRequest } from "@/middleware/validator";
import { Router } from "express";
import { createCommentSchema, updateCommentSchema } from "@/schemas/comment.schema";

export const router: Router = Router();

const commentController = new CommentController();

// Public
router.get("/comments", optionalAuth, commentController.index);
router.get("/posts/:postId/comments", optionalAuth, commentController.index);
router.get("/posts/:postId/comments/:id", optionalAuth, commentController.show);

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
router.patch("/comments/:id/like", requireAuth, commentController.likeComment);
router.delete("/comments/:id", requireAuth, canManageComment, commentController.destroy);
