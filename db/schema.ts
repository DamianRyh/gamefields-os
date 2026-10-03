import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  nickname: text("nickname").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  city: text("city").notNull().default("Warszawa"),
  coins: integer("coins").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  nicknameIdx: uniqueIndex("users_nickname_unique").on(table.nickname),
  emailIdx: uniqueIndex("users_email_unique").on(table.email),
}));

export const playerSports = sqliteTable("player_sports", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sport: text("sport").notNull(),
  skillLevel: text("skill_level").notNull().default("beginner"),
  elo: integer("elo").notNull().default(1000),
  games: integer("games").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  draws: integer("draws").notNull().default(0),
  provisionalGames: integer("provisional_games").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  userSportIdx: uniqueIndex("player_sports_user_sport_unique").on(table.userId, table.sport),
}));

export const courts = sqliteTable("courts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
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
  imageUrl: text("image_url"),
  builderProjectId: text("builder_project_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("courts_slug_unique").on(table.slug),
}));

export const homeCourts = sqliteTable("home_courts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courtId: text("court_id").notNull().references(() => courts.id, { onDelete: "cascade" }),
  sport: text("sport").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  homeCourtIdx: uniqueIndex("home_courts_user_sport_unique").on(table.userId, table.sport),
}));

export const games = sqliteTable("games", {
  id: text("id").primaryKey(),
  creatorUserId: text("creator_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courtId: text("court_id").notNull().references(() => courts.id, { onDelete: "cascade" }),
  sport: text("sport").notNull(),
  format: text("format").notNull(),
  level: text("level").notNull().default("open"),
  startsAt: integer("starts_at", { mode: "timestamp" }).notNull(),
  maxPlayers: integer("max_players").notNull(),
  status: text("status").notNull().default("open"),
  scoreA: integer("score_a"),
  scoreB: integer("score_b"),
  submittedByUserId: text("submitted_by_user_id"),
  resultConfirmedAt: integer("result_confirmed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const gamePlayers = sqliteTable("game_players", {
  id: text("id").primaryKey(),
  gameId: text("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  team: text("team"),
  joinedAt: integer("joined_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  gamePlayerIdx: uniqueIndex("game_players_game_user_unique").on(table.gameId, table.userId),
}));

export const resultConfirmations = sqliteTable("result_confirmations", {
  id: text("id").primaryKey(),
  gameId: text("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  confirmedAt: integer("confirmed_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  confirmationIdx: uniqueIndex("result_confirmations_game_user_unique").on(table.gameId, table.userId),
}));

export const eloHistory = sqliteTable("elo_history", {
  id: text("id").primaryKey(),
  gameId: text("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sport: text("sport").notNull(),
  before: integer("before").notNull(),
  after: integer("after").notNull(),
  change: integer("change").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  historyIdx: uniqueIndex("elo_history_game_user_unique").on(table.gameId, table.userId),
}));

export const courtCheckins = sqliteTable("court_checkins", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courtId: text("court_id").notNull().references(() => courts.id, { onDelete: "cascade" }),
  checkedInAt: integer("checked_in_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const challenges = sqliteTable("challenges", {
  id: text("id").primaryKey(),
  creatorUserId: text("creator_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courtId: text("court_id").notNull().references(() => courts.id, { onDelete: "cascade" }),
  sport: text("sport").notNull(),
  format: text("format").notNull().default("1v1"),
  startsAt: integer("starts_at", { mode: "timestamp" }).notNull(),
  status: text("status").notNull().default("pending"),
  message: text("message"),
  gameId: text("game_id").references(() => games.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const challengePlayers = sqliteTable("challenge_players", {
  id: text("id").primaryKey(),
  challengeId: text("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  side: text("side").notNull(),
  role: text("role").notNull().default("invitee"),
  status: text("status").notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  respondedAt: integer("responded_at", { mode: "timestamp" }),
}, (table) => ({
  challengePlayerIdx: uniqueIndex("challenge_players_challenge_user_unique").on(table.challengeId, table.userId),
}));

export const challengeMessages = sqliteTable("challenge_messages", {
  id: text("id").primaryKey(),
  challengeId: text("challenge_id").notNull().references(() => challenges.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const coinLedger = sqliteTable("coin_ledger", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sourceType: text("source_type").notNull(),
  sourceId: text("source_id").notNull(),
  amount: integer("amount").notNull(),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  coinSourceIdx: uniqueIndex("coin_ledger_user_source_unique").on(table.userId, table.sourceType, table.sourceId),
}));

export const courtReports = sqliteTable("court_reports", {
  id: text("id").primaryKey(),
  courtId: text("court_id").notNull().references(() => courts.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  description: text("description"),
  photoUrl: text("photo_url"),
  status: text("status").notNull().default("open"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const courtReportSupports = sqliteTable("court_report_supports", {
  id: text("id").primaryKey(),
  reportId: text("report_id").notNull().references(() => courtReports.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  supportIdx: uniqueIndex("court_report_supports_report_user_unique").on(table.reportId, table.userId),
}));
