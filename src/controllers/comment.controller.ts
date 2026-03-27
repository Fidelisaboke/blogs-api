import { CommentService } from "@/services/comment.service";
import { BaseController, type ICrudController } from "./base.controller";
import type { NextFunction, Request, Response } from "express";
import type { AuthRequest } from "@/types/auth";
import { AppError } from "@/lib/errors";

export class CommentController extends BaseController implements ICrudController {
  private readonly service: CommentService;

  constructor(service?: CommentService) {
    super();
    this.service = service ?? new CommentService();
  }

  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get pagination query params
      const page = Math.max(Number(req.query.page) || 1, 1);
      const pageSize = Math.min(Number(req.query.limit) || 10, 100);

      // Fetch comments
      const postId = this.parseIdParam(req.params.postId);
      const result = await this.service.getComments(postId, page, pageSize);
      return this.success(res, result, "Comments retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ensure user is authenticated
      const authReq = req as AuthRequest;
      if (!authReq.user) throw new AppError("User not authenticated", 401);

      // Create comment
      const commentData = {
        ...req.body,
        authorId: authReq.user.id,
      };
      const postId = this.parseIdParam(req.params.postId);
      const comment = await this.service.insertComment(postId, commentData);
      return this.success(res, comment, "Comment created successfully", 201);
    } catch (error) {
      next(error);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commentId = this.parseIdParam(req.params.id);
      const comment = await this.service.getCommentById(commentId);
      return this.success(res, comment, "Comment retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if comment exists
      const authReq = req as AuthRequest;
      if (!authReq.comment) throw new AppError("Comment not found", 404);

      // Validate content
      const { content } = req.body;
      if (!content || typeof content !== "string") {
        throw new AppError("Content is required", 400);
      }

      // Update comment
      const comment = await this.service.updateComment(authReq.comment.id, { content });
      return this.success(res, comment, "Comment updated successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  destroy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if comment exists
      const authReq = req as AuthRequest;
      if (!authReq.comment) throw new AppError("Comment not found", 404);

      // Delete comment
      await this.service.deleteComment(authReq.comment.id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
