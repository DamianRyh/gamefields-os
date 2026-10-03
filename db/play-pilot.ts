import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { courts, games, users } from "./schema";

export const gameSettlements = sqliteTable("play_game_settlements", {
  gameId: text("game_id").primaryKey().references(() => games.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const courtRedesigns = sqliteTable("play_court_redesigns", {
  id: text("id").primaryKey(),
  courtId: text("court_id").notNull().references(() => courts.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sport: text("sport").notNull(),
  title: text("title").notNull(),
  project: text("project").notNull(),
  status: text("status").notNull().default("community"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
},t=>({courtIdx:index("play_redesigns_court_idx").on(t.courtId,t.createdAt)}));

export const redesignVotes = sqliteTable("play_redesign_votes", {
  id: text("id").primaryKey(),
  redesignId: text("redesign_id").notNull().references(() => courtRedesigns.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (t) => ({ voteUnique: uniqueIndex("play_redesign_votes_unique").on(t.redesignId, t.userId) }));
