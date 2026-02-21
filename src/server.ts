import express, { type Request, type Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { users, posts } from './db/schema/index';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = '/api/v1';

// Auth routes
app.all(`${API_PREFIX}/auth/*`, toNodeHandler(auth));

app.use(express.json());

// Root endpoint
app.get(`${API_PREFIX}`, async (req: Request, res: Response) => {
  res.json({ "message": "Hello World!" });
});

// Create a new blog post
app.post(`${API_PREFIX}/posts`, async (req: Request, res: Response) => {
  const { title, content, authorId } = req.body;
  const newPost = await db.insert(posts).values({ title, content, authorId }).returning();
  res.json(newPost[0]);
});

// Get all published posts with author details
app.get(`${API_PREFIX}/posts`, async (req: Request, res: Response) => {
  const publishedPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      authorName: users.name,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.published, true));

  res.json(publishedPosts);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
