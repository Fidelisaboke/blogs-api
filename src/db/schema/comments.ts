import { integer, pgTable, serial, text, index, timestamp } from "drizzle-orm/pg-core";
import { posts } from "./posts";
import { users } from "./auth";
import { relations, type InferSelectModel } from "drizzle-orm";

export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    parentId: integer("parent_id").references((): any => comments.id, { onDelete: "cascade" }),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    likes: integer("likes").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("comment_postId_idx").on(table.postId),
    index("comment_authorId_idx").on(table.authorId),
    index("comment_parentId_idx").on(table.parentId),
  ],
);

export type Comment = InferSelectModel<typeof comments>;

export const commentRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "commentReplies",
  }),
  replies: many(comments, { relationName: "commentReplies" }),
}));
