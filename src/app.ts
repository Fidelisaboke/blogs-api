import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import { API_PREFIX, PORT } from './lib/constants';
import { postRoutes } from "./routes/index";
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Better Auth
app.all("/api/v1/auth/*splat", toNodeHandler(auth));

//Express JSON parsing
app.use(express.json());

// Routes
app.use(`${API_PREFIX}/posts`, postRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
