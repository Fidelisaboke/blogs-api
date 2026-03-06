import { Router } from 'express';
import { PostController } from '@/controllers';
import { validateRequest } from '@/middleware/validator';
import { createPostSchema, updatePostSchema } from '@/schemas';

export const router: Router = Router();

const postController = new PostController();

router.get("/", (req, res, next) => postController.listPosts(req, res, next));
router.post("/", validateRequest(createPostSchema), (req, res, next) => postController.createPost(req, res, next));
router.get("/:id", (req, res, next) => postController.retrievePost(req, res, next));
router.patch("/:id", validateRequest(updatePostSchema), (req, res, next) => postController.updatePost(req, res, next));
router.delete("/:id", (req, res, next) => postController.deletePost(req, res, next));
