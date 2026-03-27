import { AppError } from "@/lib/errors";
import { PostService } from "@/services/post.service";
import type { AuthRequest } from "@/types/auth";
import type { NextFunction, Request, Response } from "express";
import { BaseController, type ICrudController } from "./base.controller";

export class PostController extends BaseController implements ICrudController {
  private readonly service: PostService;

  constructor(service?: PostService) {
    super();
    this.service = service ?? new PostService();
  }

  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const page = Number(req.query.page) || 1;
      const pageSize = Math.min(Number(req.query.limit) || 10, 100);

      const result = await this.service.getPosts(
        authReq.session?.activeOrganizationId,
        page,
        pageSize,
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
        title: req.body.title,
        content: req.body.content,
        categoryId: req.body.categoryId,
        published: req.body.published,
        authorId: authReq.user.id,
        organizationId: organizationId,
      };

      const post = await this.service.createPostWithTags(postData, req.body.tags);
      return this.success(res, post, "Post created successfully", 201);
    } catch (error) {
      next(error);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const postId = this.parseIdParam(req.params.id);
      const post = await this.service.getPostById(postId, authReq.session?.activeOrganizationId);
      return this.success(res, post, "Post retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if post exists
      const authReq = req as AuthRequest;
      if (!authReq.post) throw new AppError("Post not found", 404);

      // Update post with tags
      const { title, content, published, categoryId } = req.body;
      const post = await this.service.updatePostWithTags(
        authReq.post.id,
        { title, content, published, categoryId },
        req.body.tags,
      );

      return this.success(res, post, "Post updated successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  destroy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if post exists
      const authReq = req as AuthRequest;
      if (!authReq.post) throw new AppError("Post not found", 404);

      await this.service.deletePost(authReq.post.id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
