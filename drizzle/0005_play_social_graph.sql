CREATE TABLE IF NOT EXISTS play_player_follows (
  id TEXT PRIMARY KEY NOT NULL,
  follower_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  UNIQUE(follower_user_id, following_user_id)
);

CREATE TABLE IF NOT EXISTS play_notifications (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  entity_id TEXT,
  title TEXT NOT NULL,
  body TEXT,
  read_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS play_player_follows_following_idx ON play_player_follows(following_user_id, created_at);
CREATE INDEX IF NOT EXISTS play_notifications_user_idx ON play_notifications(user_id, read_at, created_at DESC);
