import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { comments } from "./comments";
import { relations, type InferSelectModel } from "drizzle-orm";

export const commentLikes = pgTable(
  "comment_likes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    commentId: integer("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.commentId] })],
);

export type CommentLike = InferSelectModel<typeof commentLikes>;

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  user: one(users, {
    fields: [commentLikes.userId],
    references: [users.id],
  }),
  comment: one(comments, {
    fields: [commentLikes.commentId],
    references: [comments.id],
  }),
}));
