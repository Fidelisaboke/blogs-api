import { pgTable, serial, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from "drizzle-orm";

import { users } from './auth';

export const posts = pgTable(
    'posts', 
    {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    published: boolean('published').default(false),
    authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    },
    (table) => [index("post_authorId_idx").on(table.authorId)]
);

export const postRelations = relations(posts, ({ one }) => ({
    user: one(users, {
        fields: [posts.authorId],
        references: [users.id],
    }),
}));
