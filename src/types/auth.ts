import type { Request } from 'express';
import { auth } from "@/lib/auth";
import type { Post } from "@/db/schema";

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session.session;

export interface AuthRequest extends Request {
    user: User;
    session: Session;
    post?: Post;
}