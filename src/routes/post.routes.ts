import { Router } from 'express';
import { PostController } from '@/controllers';
import { validateRequest } from '@/middleware/validator';
import { createPostSchema, updatePostSchema } from '@/schemas';
import { requireAuth, optionalAuth } from '@/middleware/auth';
import { canManagePost } from '@/middleware/posts';

export const router: Router = Router();

const postController = new PostController();

// Public
router.get("/", optionalAuth, postController.index);
router.get("/:id", optionalAuth, postController.show);

// Protected
router.post("/", requireAuth, validateRequest(createPostSchema), postController.create);
router.patch("/:id", requireAuth, canManagePost, validateRequest(updatePostSchema), postController.update);
router.delete("/:id", requireAuth, canManagePost, postController.destroy);
