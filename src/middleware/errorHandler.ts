import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/lib/errors";
import logger from "@/lib/logger";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }

    logger.error({ err, route: req.originalUrl }, "Unexpected error occurred");
    return res.status(500).json({ success: false, message: "Internal Server Error" });
}