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
  try {
    // TODO: Add authentication middleware to verify user session
    const { title, content, authorId } = req.body;

    if (!title || !authorId) {
      return res.status(400).json({ error: 'title and authorId are required' });
    }

    const newPost = await db.insert(posts).values({ title, content, authorId }).returning();
    res.status(201).json(newPost[0]);
  } catch (error) {
    console.error('Failed to create post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get all published posts with author details
app.get(`${API_PREFIX}/posts`, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;
  
    const publishedPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        authorName: users.name,
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.published, true))
      .limit(limit)
      .offset(offset);

    res.json(publishedPosts);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
