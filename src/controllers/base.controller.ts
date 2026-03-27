import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/lib/response";
import { AppError } from "@/lib/errors";

export abstract class BaseController {
  /**
   * Standard success response
   */
  protected success<T>(res: Response, data: T, message: string = "Success", code: number = 200) {
    return res.status(code).json(ApiResponse.success(data, message));
  }

  /**
   * Standard error response (for manual controller errors)
   */
  protected error(
    res: Response,
    message: string = "Error",
    code: number = 400,
    errors: any = null,
  ) {
    return res.status(code).json(ApiResponse.error(errors, message));
  }

  /**
   * Parse ID from a string to a number
   * @param id ID to be parsed to a number
   */
  protected parseIdParam(id: any): number {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new AppError("Invalid resource ID", 400);
    }
    return numericId;
  }
}

/**
 * Interface for CRUD resource controllers.
 * Specifies the properties to be implemented by RESTful controllers.
 */
export interface ICrudController {
  /** List all resources */
  index(req: Request, res: Response, next: NextFunction): Promise<any>;

  /** Store a new resource */
  create(req: Request, res: Response, next: NextFunction): Promise<any>;

  /** Display a specific resource */
  show(req: Request, res: Response, next: NextFunction): Promise<any>;

  /** Update a specific resource */
  update(req: Request, res: Response, next: NextFunction): Promise<any>;

  /** Remove a specific resource */
  destroy(req: Request, res: Response, next: NextFunction): Promise<any>;
}
