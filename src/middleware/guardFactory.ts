import type { Request, Response, NextFunction } from "express";
import { type AuthRequest } from "@/types/auth";
import { AppError } from "@/lib/errors";
import { db } from "@/db";

type DbType = typeof db;
type UserType = NonNullable<AuthRequest["user"]>;

export const createResourceGuard = <T>(
  resourceName: string,
  fetcher: (db: DbType, id: number, userId: string) => Promise<T | undefined>,
  canManage: (user: UserType, resource: T) => boolean | undefined,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const id = Number(authReq.params.id);
      if (!Number.isInteger(id) || id <= 0) throw new AppError(`Invalid ${resourceName} ID`, 400);

      if (!authReq.user?.id) throw new AppError("Authentication required", 401);

      const resource = await fetcher(db, id, authReq.user.id);

      if (!resource) throw new AppError(`${resourceName} not found`, 404);

      if (!canManage(authReq.user, resource)) {
        // Return 404
        throw new AppError(
          `You do not have permission to manage this ${resourceName.toLowerCase()}`,
          403,
        );
      }

      // Attach to request dynamically
      (authReq as any)[resourceName.toLowerCase()] = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};
