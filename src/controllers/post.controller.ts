import { AppError } from '@/lib/errors';
import { PostService } from '@/services/post.service';
import type { AuthRequest } from '@/types/auth';
import type { NextFunction, Request, Response } from 'express';


export class PostController {
  service: PostService;

  constructor() {
    this.service = new PostService();
  }

  listPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const page = Number(req.query.page) || 1;
      const pageSize = Math.min(Number(req.query.limit) || 10, 100);

      const result = await this.service.getPosts(authReq.session?.activeOrganizationId, page, pageSize);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const organizationId = authReq.session?.activeOrganizationId;

      // Ensure user is authenticated
      if (!authReq.user) {
        throw new AppError("User not authenticated", 401);
      }

      // Check if an active organization has been selected
      if (!organizationId) {
        throw new AppError("No active organization selected", 400);
      }

      // Set author ID and organization ID
      const postData = {
        ...req.body,
        authorId: authReq.user.id,
        organizationId: organizationId,
      };

      const post = await this.service.insertPost(postData);
      return res.status(201).json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  retrievePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if ID is a number
      const postId = Number(req.params.id);
      if (isNaN(postId)) throw new AppError("Invalid post ID", 400);

      const authReq = req as AuthRequest;

      // Retrieve post
      const post = await this.service.getPostById(postId, authReq.session?.activeOrganizationId);
      return res.status(200).json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if ID is a number
      const postId = Number(req.params.id);
      if (isNaN(postId)) throw new AppError("Invalid post ID", 400);

      // Check if post exists
      const authReq = req as AuthRequest;
      if (!authReq.post) throw new AppError("Post not found", 404);

      // Update post
      const post = await this.service.updatePost(postId, req.body);
      return res.status(200).json({ success: true, data: post, message: "Post updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;

      // Check if ID is a number
      const postId = Number(req.params.id);
      if (isNaN(postId)) throw new AppError("Invalid post ID", 400);

      // Check if post exists
      if (!authReq.post) throw new AppError("Post not found", 404);

      // Delete post
      await this.service.deletePost(postId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
