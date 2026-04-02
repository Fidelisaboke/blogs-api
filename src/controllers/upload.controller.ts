import { BaseController } from "./base.controller";
import { UploadService } from "@/services/upload.service";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/lib/errors";

export class UploadController extends BaseController {
  private readonly service: UploadService;

  constructor(service?: UploadService) {
    super();
    this.service = service ?? new UploadService();
  }

  upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError("No file uploaded", 400);
      }

      const result = await this.service.processImage(req.file);
      return this.success(res, result, "Image uploaded successfully", 201);
    } catch (error) {
      next(error);
    }
  };
}
