CREATE TABLE content_posts (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  pillar TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pomysl',
  publish_date TEXT,
  body TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  url TEXT,
  metrics_json TEXT NOT NULL DEFAULT '{}',
  created_by_user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX content_posts_publish_date ON content_posts (publish_date);
CREATE INDEX content_posts_status ON content_posts (status);
