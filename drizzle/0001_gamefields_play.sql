CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE,
  nickname TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  city TEXT NOT NULL DEFAULT 'Warszawa',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS player_sports (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  elo INTEGER NOT NULL DEFAULT 1000,
  games INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  provisional_games INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  UNIQUE(user_id, sport)
);

CREATE TABLE IF NOT EXISTS courts (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Warszawa',
  district TEXT,
  address TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  sports TEXT NOT NULL,
  surface TEXT,
  lighting INTEGER NOT NULL DEFAULT 0,
  is_free INTEGER NOT NULL DEFAULT 1,
  image_url TEXT,
  builder_project_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS home_courts (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  court_id TEXT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, sport)
);

CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY NOT NULL,
  creator_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  court_id TEXT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  format TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'open',
  starts_at INTEGER NOT NULL,
  max_players INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  score_a INTEGER,
  score_b INTEGER,
  submitted_by_user_id TEXT,
  result_confirmed_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS game_players (
  id TEXT PRIMARY KEY NOT NULL,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team TEXT,
  joined_at INTEGER NOT NULL,
  UNIQUE(game_id, user_id)
);

CREATE TABLE IF NOT EXISTS result_confirmations (
  id TEXT PRIMARY KEY NOT NULL,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  confirmed_at INTEGER NOT NULL,
  UNIQUE(game_id, user_id)
);

CREATE TABLE IF NOT EXISTS elo_history (
  id TEXT PRIMARY KEY NOT NULL,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  before INTEGER NOT NULL,
  after INTEGER NOT NULL,
  change INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(game_id, user_id)
);

CREATE TABLE IF NOT EXISTS court_checkins (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  court_id TEXT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  checked_in_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS court_reports (
  id TEXT PRIMARY KEY NOT NULL,
  court_id TEXT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS court_report_supports (
  id TEXT PRIMARY KEY NOT NULL,
  report_id TEXT NOT NULL REFERENCES court_reports(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  UNIQUE(report_id, user_id)
);

CREATE INDEX IF NOT EXISTS games_starts_at_idx ON games(starts_at);
CREATE INDEX IF NOT EXISTS games_court_idx ON games(court_id);
CREATE INDEX IF NOT EXISTS checkins_court_expiry_idx ON court_checkins(court_id, expires_at);
CREATE INDEX IF NOT EXISTS player_sports_rank_idx ON player_sports(sport, elo DESC);

INSERT OR IGNORE INTO courts (id, slug, name, city, district, address, latitude, longitude, sports, surface, lighting, is_free, image_url, created_at, updated_at)
VALUES
('court_lazienkowski', 'lazienkowski-bridge', 'Łazienkowski Bridge', 'Warszawa', 'Śródmieście', 'Cypel Czerniakowski, Warszawa', 52.22638, 21.04782, '["football"]', 'hard', 1, 1, NULL, unixepoch(), unixepoch()),
('court_agrykola', 'agrykola', 'Agrykola', 'Warszawa', 'Śródmieście', 'Agrykola, Warszawa', 52.21495, 21.02874, '["basketball","football"]', 'hard', 1, 1, NULL, unixepoch(), unixepoch());
