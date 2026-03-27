import { relations, type InferSelectModel } from "drizzle-orm";
import { pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { tagsToPosts } from "./tagsToPosts";

export const tags = pgTable(
  "tags",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("tag_name_uidx").on(table.name)],
);

export type Tag = InferSelectModel<typeof tags>;

export const tagRelations = relations(tags, ({ many }) => ({
  tagsToPosts: many(tagsToPosts),
}));
