import rateLimit from "express-rate-limit";
import { config } from "@/lib/config";

// Global / General Limit
export const globalRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.GLOBAL_WINDOW_MS,
  limit: config.RATE_LIMIT.GLOBAL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
});

// Auth Route Limit
export const authRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.AUTH_WINDOW_MS,
  limit: config.RATE_LIMIT.AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many authentication attempts, please try again later.",
  },
});

// Write Actions Limit
export const writeRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.WRITE_WINDOW_MS,
  limit: config.RATE_LIMIT.WRITE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "You are performing too many write operations, please slow down.",
  },
});
