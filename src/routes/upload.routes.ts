import { Router } from "express";
import { UploadController } from "@/controllers/upload.controller";
import { requireAuth } from "@/middleware/auth";
import { uploadMiddleware } from "@/middleware/upload.middleware";

export const router: Router = Router();
const controller = new UploadController();

// Only authenticated users can upload images
router.post("/", requireAuth, uploadMiddleware.single("image"), controller.upload);
