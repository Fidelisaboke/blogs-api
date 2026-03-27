import { Router } from "express";
import { CategoryController } from "@/controllers/category.controller";
import { canManageCategories, requireAuth } from "@/middleware/auth";
import { createCategory, updateCategory } from "@/schemas/category.schema";
import { validateRequest } from "@/middleware/validator";

export const router: Router = Router();

const categoryController = new CategoryController();

// Public
router.get("/", categoryController.index);
router.get("/:id", categoryController.show);

// Protected
router.post(
  "/",
  requireAuth,
  canManageCategories,
  validateRequest(createCategory),
  categoryController.create,
);
router.patch(
  "/:id",
  requireAuth,
  canManageCategories,
  validateRequest(updateCategory),
  categoryController.update,
);
router.delete("/:id", requireAuth, canManageCategories, categoryController.destroy);
