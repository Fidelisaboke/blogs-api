import { pgTable, serial, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { relations, type InferSelectModel } from "drizzle-orm";

import { users, organizations } from './auth';

export const posts = pgTable(
    'posts', 
    {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    published: boolean('published').default(false).notNull(),
    authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    },
    (table) => [index("post_authorId_idx").on(table.authorId)]
);

export type Post = InferSelectModel<typeof posts>;

export const postRelations = relations(posts, ({ one }) => ({
    user: one(users, {
        fields: [posts.authorId],
        references: [users.id],
    }),
    organization: one(organizations, {
        fields: [posts.organizationId],
        references: [organizations.id],
    })
}));
