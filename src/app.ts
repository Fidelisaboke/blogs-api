import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { config } from "./lib/config";
import { postRoutes, commentRoutes, categoryRoutes } from "./routes/index";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Better Auth
app.all("/api/v1/auth/*splat", toNodeHandler(auth));

// CORS middleware
app.use(cors());

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
