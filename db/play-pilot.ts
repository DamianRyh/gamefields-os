import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { games } from "./schema";

export const gameSettlements = sqliteTable("play_game_settlements", {
  gameId: text("game_id").primaryKey().references(() => games.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

