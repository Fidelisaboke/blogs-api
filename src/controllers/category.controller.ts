import type { NextFunction, Request, Response } from "express";
import { BaseController, type ICrudController } from "./base.controller";
import { CategoryService } from "@/services/category.service";

export class CategoryController extends BaseController implements ICrudController {
  private readonly service: CategoryService;

  constructor(service?: CategoryService) {
    super();
    this.service = service ?? new CategoryService();
  }

  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const pageSize = Math.min(Math.max(1, Number(req.query.limit) || 10), 100);
      const q = req.query.q as string | undefined;
      const result = await this.service.getCategories(page, pageSize, q);
      return this.success(res, result, "Retrieved categories successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.service.insertCategory(req.body);
      return this.success(res, category, "Category created successfully", 201);
    } catch (error) {
      next(error);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categoryId = this.parseIdParam(req.params.id);
      const category = await this.service.getCategoryById(categoryId);
      return this.success(res, category, "Category retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categoryId = this.parseIdParam(req.params.id);
      const category = await this.service.updateCategory(categoryId, req.body);
      return this.success(res, category, "Category updated successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  destroy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categoryId = this.parseIdParam(req.params.id);
      await this.service.deleteCategory(categoryId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
