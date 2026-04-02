import multer from "multer";
import path from "path";
import { AppError } from "@/lib/errors";
import { config } from "@/lib/config";

// Configure storage for multer
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new AppError("Only images (jpeg, jpg, png, webp, gif) are allowed", 400));
  }
};

// Multer upload middleware
export const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
});
