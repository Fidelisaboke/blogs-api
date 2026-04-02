import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import { AppError } from "@/lib/errors";

export class UploadService {
  private readonly uploadPath = path.join(process.cwd(), "public", "uploads");

  constructor() {
    this.ensureDir();
  }

  private async ensureDir() {
    try {
      await fs.mkdir(this.uploadPath, { recursive: true });
    } catch (error) {
      console.error("Error creating directory:", error);
      throw new AppError("Failed to create directory", 500);
    }
  }

  async processImage(file: Express.Multer.File) {
    const filename = `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
    const thumbnailFilename = `thumb_${filename}`;

    try {
      // Process main image
      await sharp(file.buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .toFile(path.join(this.uploadPath, filename));

      // Generate thumbnail
      await sharp(file.buffer)
        .resize(200, 200, { fit: "cover" })
        .toFile(path.join(this.uploadPath, thumbnailFilename));

      return {
        url: `/public/uploads/${filename}`,
        thumbnailUrl: `/public/uploads/${thumbnailFilename}`,
      };
    } catch (error) {
      console.error("Image processing error:", error);
      throw new AppError("Failed to process image", 500);
    }
  }
}
