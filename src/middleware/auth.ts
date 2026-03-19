import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "@/types/auth";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { AppError } from "@/lib/errors";

/**
 * Middleware that requires authenticated access.
 * @param req Request payload
 * @param res Response payload
 * @param next Next function
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) throw new AppError("Unauthorized", 401);

    // Attach session and user data to request
    const authReq = req as AuthRequest;
    authReq.user = session.user;
    authReq.session = session.session;

    next();
}

/**
 * Middleware for optional auth. It's used for attaching session and user data to request.
 * @param req Request payload
 * @param res Response payload
 * @param next Next function
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    const authReq = req as AuthRequest;

    // Attach session data if available
    if (session) {
        authReq.user = session.user;
        authReq.session = session.session
    }

    next();
}