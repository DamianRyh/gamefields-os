import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { users } from "./schema";

export const playerFollows = sqliteTable("play_player_follows", {
  id: text("id").primaryKey(),
  followerUserId: text("follower_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingUserId: text("following_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  followUnique: uniqueIndex("play_player_follows_unique").on(table.followerUserId, table.followingUserId),
}));

export const playNotifications = sqliteTable("play_notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  type: text("type").notNull(),
  entityId: text("entity_id"),
  title: text("title").notNull(),
  body: text("body"),
  readAt: integer("read_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
