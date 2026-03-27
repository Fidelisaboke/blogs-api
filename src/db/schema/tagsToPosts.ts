import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { relations, type InferSelectModel } from "drizzle-orm";
import { posts } from "./posts";
import { tags } from "./tags";

export const tagsToPosts = pgTable(
  "tags_to_posts",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.tagId, table.postId] })],
);

export type TagToPost = InferSelectModel<typeof tagsToPosts>;

export const tagsToPostsRelations = relations(tagsToPosts, ({ one }) => ({
  post: one(posts, {
    fields: [tagsToPosts.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [tagsToPosts.tagId],
    references: [tags.id],
  }),
}));
