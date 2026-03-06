import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/lib/errors";
import logger from "@/lib/logger";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        logger.error({ err: err, route: req.originalUrl }, "Operational error occurred");
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }

    logger.error({ err, route: req.originalUrl }, "Unexpected error occurred");
    res.status(500).json({ success: false, message: "Internal Server Error" });
}