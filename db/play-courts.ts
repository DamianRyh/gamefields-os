import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./schema";

export const courtSubmissions = sqliteTable("play_court_submissions", {
  id: text("id").primaryKey(),
  submitterUserId: text("submitter_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  city: text("city").notNull().default("Warszawa"),
  district: text("district"),
  address: text("address"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  sports: text("sports").notNull(),
  surface: text("surface"),
  lighting: integer("lighting", { mode: "boolean" }).notNull().default(false),
  isFree: integer("is_free", { mode: "boolean" }).notNull().default(true),
  notes: text("notes"),
  imageUrl: text("image_url"),
  reviewNote: text("review_note"),
  status: text("status").notNull().default("pending"),
  publishedCourtId: text("published_court_id"),
  reviewedByUserId: text("reviewed_by_user_id").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
