import { pgTable, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from "drizzle-orm";

import { users } from './auth';

export const posts = pgTable('posts', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    published: boolean('published').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    authorId: text('author_id').references(() => users.id),
});

export const postRelations = relations(posts, ({ one }) => ({
    user: one(users, {
        fields: [posts.authorId],
        references: [users.id],
    }),
}));
