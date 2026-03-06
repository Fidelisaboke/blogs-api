import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validateRequest = (schema: z.ZodType<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const flattened = z.flattenError(result.error);
            return res.status(400).json({
                message: "Validation failed",
                errors: flattened.formErrors,
                fieldErrors: flattened.fieldErrors,
            });
        }
        req.body = result.data;
        next();
    }
}