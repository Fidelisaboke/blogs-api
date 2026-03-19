import { Router } from 'express';
import { PostController } from '@/controllers';
import { validateRequest } from '@/middleware/validator';
import { createPostSchema, updatePostSchema } from '@/schemas';
import { requireAuth, optionalAuth } from '@/middleware/auth';
import { canManagePost } from '@/middleware/posts';

export const router: Router = Router();

const postController = new PostController();

// Public
router.get("/", optionalAuth, postController.listPosts);
router.get("/:id", optionalAuth, postController.retrievePost);

// Protected
router.post("/", requireAuth, validateRequest(createPostSchema), postController.createPost);
router.patch("/:id", requireAuth, canManagePost, validateRequest(updatePostSchema), postController.updatePost);
router.delete("/:id", requireAuth, canManagePost, postController.deletePost);
