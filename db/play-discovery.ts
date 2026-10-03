import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { courts, users } from "./schema";

export const playAvailability = sqliteTable("play_availability", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sport: text("sport").notNull(),
  courtId: text("court_id").references(() => courts.id, { onDelete: "set null" }),
  availableUntil: integer("available_until", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  userSportUnique: uniqueIndex("play_availability_user_sport_unique").on(table.userId, table.sport),
}));
