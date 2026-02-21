import express, { type Request, type Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { users, posts } from './db/schema';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Root endpoint
app.get('/', async (req: Request, res: Response) => {
  res.json({ "message": "Hello World!" });
});

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

// Get all users
app.get('/users', async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch users' });
  }
});

// Get a user by ID
app.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (typeof idParam !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const userId = parseInt(idParam, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'User ID must be a number' });
    }
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user[0]);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch user' });
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
