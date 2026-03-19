// src/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/lib/errors";
import { ApiResponse } from "@/lib/response";
import logger from "@/lib/logger";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Delegate to Express default handler if headers already sent
    if (res.headersSent) {
        return next(err);
    }

    // Handle known operational errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json(
            ApiResponse.error(null, err.message)
        );
    }

    // Log unexpected errors
    logger.error({ 
        err: err.message || err, 
        stack: err.stack,
        route: req.originalUrl 
    }, "Unexpected error occurred");

    // Return standardized internal server errors
    return res.status(500).json(
        ApiResponse.error(null, "Internal Server Error")
    );
};