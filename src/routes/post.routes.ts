import { Router } from 'express';
import { createPosts, getPosts } from '@/controllers/postController';

const router: Router = Router();

router.get("/", getPosts);
router.post("/", createPosts);

export default router;