import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { courts, users } from "./schema";

export const builderProjects = sqliteTable("builder_projects", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectKey: text("project_key").notNull(),
  courtId: text("court_id").references(() => courts.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  sport: text("sport").notNull(),
  projectJson: text("project_json").notNull(),
  source: text("source").notNull().default("studio"),
  visibility: text("visibility").notNull().default("private"),
  status: text("status").notNull().default("draft"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  ownerProjectUnique: uniqueIndex("builder_projects_owner_project_unique").on(table.ownerUserId, table.projectKey),
}));

export const builderProjectSupports = sqliteTable("builder_project_supports", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => builderProjects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  projectUserUnique: uniqueIndex("builder_project_supports_unique").on(table.projectId, table.userId),
}));
