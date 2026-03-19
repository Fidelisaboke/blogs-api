import { db } from "@/db";
import { posts } from "@/db/schema";
import { AppError } from "@/lib/errors";
import type { AuthRequest } from "@/types/auth";
import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { members } from "@/db/schema";

export const canManagePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthRequest;
        const postId = Number(authReq.params.id);
        if (Number.isNaN(postId) || postId <= 0 ) throw new AppError("Invalid post ID", 400);

        const userId = authReq.user.id;

        // Fetch post and user's role in post's organization
        const postWithMember = await db.query.posts.findFirst({
            where: eq(posts.id, postId),
            with: {
                organization: {
                    with: {
                        members: {
                            where: eq(members.userId, userId)
                        }
                    }
                }
            }
        })

        if (!postWithMember) throw new AppError("Post not found", 404);

        const userRole = postWithMember.organization.members[0]?.role;
        const isOwner = postWithMember.authorId === userId;

        // Organization owner or admin
        const isAdmin = userRole === 'admin' || userRole === 'owner';

        // Check for ownership or admin
        if (!isOwner && !isAdmin) throw new AppError("You do not have permission to manage this post", 403);

        // Save data for controller
        authReq.post = postWithMember;
        next();
    } catch (error) {
        next(error);
    }
}
