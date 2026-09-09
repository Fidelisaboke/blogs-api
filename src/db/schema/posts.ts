import { pgTable, serial, text, boolean, timestamp, index, integer } from "drizzle-orm/pg-core";
import { relations, type InferSelectModel } from "drizzle-orm";

import { users, organizations } from "./auth";
import { comments } from "./comments";
import { categories } from "./categories";
import { tagsToPosts } from "./tagsToPosts";

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    published: boolean("published").default(false).notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("post_authorId_idx").on(table.authorId)],
);

export type Post = InferSelectModel<typeof posts>;

export const postRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [posts.organizationId],
    references: [organizations.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  comments: many(comments),
  tagsToPosts: many(tagsToPosts),
}));
