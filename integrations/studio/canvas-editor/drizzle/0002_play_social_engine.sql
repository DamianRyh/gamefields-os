ALTER TABLE users ADD COLUMN coins INTEGER NOT NULL DEFAULT 0;
ALTER TABLE player_sports ADD COLUMN skill_level TEXT NOT NULL DEFAULT 'beginner';

CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY NOT NULL,
  creator_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  court_id TEXT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT '1v1',
  starts_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  game_id TEXT REFERENCES games(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS challenge_players (
  id TEXT PRIMARY KEY NOT NULL,
  challenge_id TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  side TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'invitee',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  responded_at INTEGER,
  UNIQUE(challenge_id, user_id)
);

CREATE TABLE IF NOT EXISTS challenge_messages (
  id TEXT PRIMARY KEY NOT NULL,
  challenge_id TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS coin_ledger (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  note TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, source_type, source_id)
);

CREATE INDEX IF NOT EXISTS challenges_status_start_idx ON challenges(status, starts_at);
CREATE INDEX IF NOT EXISTS challenge_players_user_idx ON challenge_players(user_id, status);
CREATE INDEX IF NOT EXISTS challenge_messages_challenge_idx ON challenge_messages(challenge_id, created_at);
CREATE INDEX IF NOT EXISTS coin_ledger_user_idx ON coin_ledger(user_id, created_at DESC);
