import "dotenv/config";
import { requireEnv } from "@/lib/utils";

const getNumber = (key: string, fallback: number) =>
  process.env[key] ? Number(process.env[key]) : fallback;

export const config = {
  API_PREFIX: "/api/v1",
  PORT: requireEnv("PORT"),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  TRUST_PROXY: getNumber("TRUST_PROXY", 1),
  RATE_LIMIT: {
    GLOBAL_WINDOW_MS: getNumber("RATE_LIMIT_GLOBAL_WINDOW_MS", 15 * 60 * 1000),
    GLOBAL_MAX: getNumber("RATE_LIMIT_GLOBAL_MAX", 300),
    AUTH_WINDOW_MS: getNumber("RATE_LIMIT_AUTH_WINDOW_MS", 15 * 60 * 1000),
    AUTH_MAX: getNumber("RATE_LIMIT_AUTH_MAX", 50),
    WRITE_WINDOW_MS: getNumber("RATE_LIMIT_WRITE_WINDOW_MS", 15 * 60 * 1000),
    WRITE_MAX: getNumber("RATE_LIMIT_WRITE_MAX", 100),
  },
  ROOT_ORGANIZATION_ID: process.env.ROOT_ORGANIZATION_ID ?? "",
  MAX_FILE_SIZE: getNumber("MAX_FILE_SIZE", 5 * 1024 * 1024), // 5MB default
  MAX_FILE_SIZE_MB: getNumber("MAX_FILE_SIZE_MB", 5), // 5MB default for display
};
