import express, { type Request, type Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { users, posts } from './db/schema';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Create a new user
app.post('/users', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const newUser = await db.insert(users).values({ name, email }).returning();
    res.json(newUser[0]);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create user' });
  }
});

// Create a new blog post
app.post('/posts', async (req: Request, res: Response) => {
  const { title, content, authorId } = req.body;
  const newPost = await db.insert(posts).values({ title, content, authorId }).returning();
  res.json(newPost[0]);
});

// Get all published posts with author details
app.get('/posts', async (req: Request, res: Response) => {
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

app.get('/', async (req: Request, res: Response) => {
  res.json({"message": "Hello World!"});
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
