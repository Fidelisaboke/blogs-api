import { relations, type InferSelectModel } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { posts } from "./posts";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Category = InferSelectModel<typeof categories>;

export const categoryRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));
