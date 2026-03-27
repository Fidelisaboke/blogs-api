import "dotenv/config";
import { requireEnv } from "@/lib/utils";

export const config = {
  API_PREFIX: "/api/v1",
  PORT: requireEnv("PORT"),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  TRUST_PROXY: process.env.TRUST_PROXY ? parseInt(process.env.TRUST_PROXY, 10) : 1,
  RATE_LIMIT: {
    GLOBAL_WINDOW_MS: process.env.RATE_LIMIT_GLOBAL_WINDOW_MS
      ? parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS, 10)
      : 15 * 60 * 1000,
    GLOBAL_MAX: process.env.RATE_LIMIT_GLOBAL_MAX
      ? parseInt(process.env.RATE_LIMIT_GLOBAL_MAX, 10)
      : 100,
    AUTH_WINDOW_MS: process.env.RATE_LIMIT_AUTH_WINDOW_MS
      ? parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 10)
      : 15 * 60 * 1000,
    AUTH_MAX: process.env.RATE_LIMIT_AUTH_MAX ? parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) : 50,
    WRITE_WINDOW_MS: process.env.RATE_LIMIT_WRITE_WINDOW_MS
      ? parseInt(process.env.RATE_LIMIT_WRITE_WINDOW_MS, 10)
      : 15 * 60 * 1000,
    WRITE_MAX: process.env.RATE_LIMIT_WRITE_MAX
      ? parseInt(process.env.RATE_LIMIT_WRITE_MAX, 10)
      : 100,
  },
};
