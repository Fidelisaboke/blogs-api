import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "@/types/auth";
import { auth } from "@/lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { AppError } from "@/lib/errors";
import { createResourceGuard } from "./guardFactory";
import { posts, comments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isRootAdmin } from "@/lib/policies";

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
};

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
    authReq.session = session.session;
  }

  next();
};

const isOrgAdminOrOwner = (members?: { role: string }[]) =>
  members?.[0] && ["admin", "owner"].includes(members[0].role);

export const canManagePost = createResourceGuard(
  "Post",
  (db, id, userId) =>
    db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        organization: {
          with: {
            members: {
              where: (m: any, { eq }: any) => eq(m.userId, userId),
            },
          },
        },
      },
    }),
  (user, post: any) => {
    const isAdmin = isOrgAdminOrOwner(post.organization?.members);
    return post.authorId === user.id || isAdmin;
  },
);

export const canManageComment = createResourceGuard(
  "Comment",
  (db, id, userId) =>
    db.query.comments.findFirst({
      where: eq(comments.id, id),
      with: {
        post: {
          with: {
            organization: {
              with: {
                members: {
                  where: (m: any, { eq }: any) => eq(m.userId, userId),
                },
              },
            },
          },
        },
      },
    }),
  (user, comment: any) => {
    const isAdmin = isOrgAdminOrOwner(comment.post?.organization?.members);
    return comment.authorId === user.id || isAdmin;
  },
);

export const canManageCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) throw new AppError("Unauthorized", 401);
    const userId = authReq.user.id;
    if (!(await isRootAdmin(userId))) throw new AppError("Forbidden", 403);

    next();
  } catch (error) {
    next(error);
  }
};
