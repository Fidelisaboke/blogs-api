import express from "express";
import cors from "cors";
import helmet from "helmet";
import { globalRateLimiter, authRateLimiter, writeRateLimiter } from "./middleware/rateLimiter";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { config } from "./lib/config";
import { postRoutes, commentRoutes, categoryRoutes } from "./routes/index";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.set("trust proxy", config.TRUST_PROXY);

// Security Headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  }),
);

// Express JSON parsing
app.use(express.json());

// Rate Limiting
app.use(`${config.API_PREFIX}/auth`, authRateLimiter);
app.use(globalRateLimiter);

// Write Limiter for state-mutating requests
app.use((req, res, next) => {
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    return writeRateLimiter(req, res, next);
  }
  return next();
});

// Better Auth
app.all(`${config.API_PREFIX}/auth/*splat`, toNodeHandler(auth));

// Express JSON parsing
app.use(express.json());

// Routes
app.use(`${config.API_PREFIX}/posts`, postRoutes);
app.use(`${config.API_PREFIX}`, commentRoutes);
app.use(`${config.API_PREFIX}/categories`, categoryRoutes);

// Error handler
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Server is running on port: ${config.PORT}`);
});
