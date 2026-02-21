import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import { API_PREFIX, PORT } from './lib/constants';

import postRoutes from './routes/post.routes';

const app = express();

// Better Auth
app.all(`${API_PREFIX}/auth/*`, toNodeHandler(auth));

// Global Middleware
app.use(express.json());

app.use(`${API_PREFIX}/posts`, postRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
