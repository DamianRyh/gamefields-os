import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { courts, users } from "./schema";

export const tournaments = sqliteTable("play_tournaments", {
  id: text("id").primaryKey(),
  organizerUserId: text("organizer_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courtId: text("court_id").notNull().references(() => courts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sport: text("sport").notNull(),
  format: text("format").notNull(),
  maxEntries: integer("max_entries").notNull().default(16),
  startsAt: integer("starts_at", { mode: "timestamp" }).notNull(),
  status: text("status").notNull().default("open"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const tournamentEntries = sqliteTable("play_tournament_entries", {
  id: text("id").primaryKey(),
  tournamentId: text("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  seed: integer("seed"),
  status: text("status").notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  tournamentUserUnique: uniqueIndex("play_tournament_entries_unique").on(table.tournamentId, table.userId),
}));

export const tournamentMatches = sqliteTable("play_tournament_matches", {
  id: text("id").primaryKey(),
  tournamentId: text("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  round: integer("round").notNull(),
  position: integer("position").notNull(),
  playerAUserId: text("player_a_user_id").references(() => users.id, { onDelete: "set null" }),
  playerBUserId: text("player_b_user_id").references(() => users.id, { onDelete: "set null" }),
  scoreA: integer("score_a"),
  scoreB: integer("score_b"),
  winnerUserId: text("winner_user_id").references(() => users.id, { onDelete: "set null" }),
  nextMatchId: text("next_match_id"),
  status: text("status").notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  matchSlotUnique: uniqueIndex("play_tournament_match_slot_unique").on(table.tournamentId, table.round, table.position),
}));
