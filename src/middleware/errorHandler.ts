// src/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { AppError } from "@/lib/errors";
import { ApiResponse } from "@/lib/response";
import { config } from "@/lib/config";
import logger from "@/lib/logger";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Delegate to Express default handler if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  // Handle Multer errors
  if (err instanceof MulterError) {
    let message = err.message;
    if (err.code === "LIMIT_UNEXPECTED_FILE" && err.field) {
      message = `Unexpected field: "${err.field}". Please use "image" for the file field.`;
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      message = `File too large. Maximum allowed size is ${config.MAX_FILE_SIZE_MB}MB.`;
    }
    return res.status(400).json(ApiResponse.error(null, message));
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(ApiResponse.error(null, err.message));
  }

  // Log unexpected errors
  logger.error(
    {
      err: err.message || err,
      stack: err.stack,
      route: req.originalUrl,
    },
    "Unexpected error occurred",
  );

  // Return standardized internal server errors
  return res.status(500).json(ApiResponse.error(null, "Internal Server Error"));
};
