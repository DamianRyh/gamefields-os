import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const contentPosts = sqliteTable("content_posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  pillar: text("pillar").notNull(),
  channel: text("channel").notNull(),
  status: text("status").notNull().default("pomysl"),
  publishDate: text("publish_date"),
  body: text("body").notNull().default(""),
  notes: text("notes").notNull().default(""),
  url: text("url"),
  metricsJson: text("metrics_json").notNull().default("{}"),
  createdByUserId: text("created_by_user_id").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
