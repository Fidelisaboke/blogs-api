import { AppError } from '@/lib/errors';
import { PostService } from '@/services/post.service';
import type { NextFunction, Request, Response } from 'express';


export class PostController {
  service: PostService;

  constructor() {
    this.service = new PostService();
  }

  async listPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Math.min(Number(req.query.limit) || 10, 100);
      const result = await this.service.getPosts(page, pageSize);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await this.service.insertPost(req.body);
      return res.status(201).json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  async retrievePost(req: Request, res: Response, next: NextFunction) {
    try {
      // Check if ID is a number
      const postId = Number(req.params.id);
      if (isNaN(postId)) throw new AppError("Invalid post ID", 400);

      // Retrieve post
      const post = await this.service.getPostById(postId);
      return res.status(200).json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      // Check if ID is a number
      const postId = Number(req.params.id);
      if (isNaN(postId)) throw new AppError("Invalid post ID", 400);

      // Update post
      const post = await this.service.updatePost(postId, req.body);
      return res.status(200).json({ success: true, data: post, message: "Post updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      // Check if ID is a number
      const postId = Number(req.params.id);
      if (isNaN(postId)) throw new AppError("Invalid post ID", 400);

      // Delete post
      await this.service.deletePost(postId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
