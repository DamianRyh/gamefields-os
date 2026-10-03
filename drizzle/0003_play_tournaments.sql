CREATE TABLE IF NOT EXISTS play_tournaments (
  id TEXT PRIMARY KEY NOT NULL,
  organizer_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  court_id TEXT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  format TEXT NOT NULL,
  max_entries INTEGER NOT NULL DEFAULT 16,
  starts_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS play_tournament_entries (
  id TEXT PRIMARY KEY NOT NULL,
  tournament_id TEXT NOT NULL REFERENCES play_tournaments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seed INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL,
  UNIQUE(tournament_id, user_id)
);

CREATE TABLE IF NOT EXISTS play_tournament_matches (
  id TEXT PRIMARY KEY NOT NULL,
  tournament_id TEXT NOT NULL REFERENCES play_tournaments(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  position INTEGER NOT NULL,
  player_a_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  player_b_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  score_a INTEGER,
  score_b INTEGER,
  winner_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  next_match_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(tournament_id, round, position)
);

CREATE INDEX IF NOT EXISTS play_tournaments_start_idx ON play_tournaments(starts_at);
CREATE INDEX IF NOT EXISTS play_tournament_entries_tournament_idx ON play_tournament_entries(tournament_id);
CREATE INDEX IF NOT EXISTS play_tournament_matches_tournament_idx ON play_tournament_matches(tournament_id, round, position);
