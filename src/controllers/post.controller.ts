import { AppError } from "@/lib/errors";
import { PostService } from "@/services/post.service";
import type { AuthRequest } from "@/types/auth";
import type { NextFunction, Request, Response } from "express";
import { BaseController, type ICrudController } from "./base.controller";

export class PostController extends BaseController implements ICrudController {
  service: PostService;

  constructor() {
    super();
    this.service = new PostService();
  }

  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const page = Number(req.query.page) || 1;
      const pageSize = Math.min(Number(req.query.limit) || 10, 100);

      // Convert string query to boolean
      let published: boolean | undefined = undefined;
      if (req.query.published === "true") published = true;
      if (req.query.published === "false") published = false;

      const result = await this.service.getPosts(
        authReq.session?.activeOrganizationId,
        page,
        pageSize,
        published,
      );

      return this.success(res, result, "Retrieved posts successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const organizationId = authReq.session?.activeOrganizationId;

      // Check if an active organization has been selected
      if (!organizationId) {
        throw new AppError("No active organization selected", 400);
      }

      // Ensure user exists
      if (!authReq.user) {
        throw new AppError("User not authenticated", 401);
      }

      // Set author ID and organization ID
      const postData = {
        ...req.body,
        authorId: authReq.user.id,
        organizationId: organizationId,
      };

      const post = await this.service.insertPost(postData);
      return this.success(res, post, "Post created successfully", 201);
    } catch (error) {
      next(error);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if ID is a number
      const postId = Number(req.params.id);
      if (isNaN(postId)) throw new AppError("Invalid post ID", 400);

      const authReq = req as AuthRequest;

      // Retrieve post
      const post = await this.service.getPostById(postId, authReq.session?.activeOrganizationId);
      return this.success(res, post, "Post retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if ID is a number
      const postId = Number(req.params.id);
      if (isNaN(postId)) throw new AppError("Invalid post ID", 400);

      // Check if post exists
      const authReq = req as AuthRequest;
      if (!authReq.post) throw new AppError("Post not found", 404);

      // Update post
      const { title, content, published } = req.body;
      const post = await this.service.updatePost(postId, { title, content, published });
      return this.success(res, post, "Post updated successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  destroy = async (req: Request, res: Response, next: NextFunction) => {
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
  };
}
