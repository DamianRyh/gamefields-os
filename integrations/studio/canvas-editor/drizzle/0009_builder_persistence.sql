CREATE TABLE IF NOT EXISTS builder_projects (
  id TEXT PRIMARY KEY NOT NULL,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_key TEXT NOT NULL,
  court_id TEXT REFERENCES courts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  project_json TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'studio',
  visibility TEXT NOT NULL DEFAULT 'private',
  status TEXT NOT NULL DEFAULT 'draft',
  published_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(owner_user_id, project_key)
);

CREATE TABLE IF NOT EXISTS builder_project_supports (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES builder_projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS builder_projects_owner_updated_idx
  ON builder_projects(owner_user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS builder_projects_court_visibility_idx
  ON builder_projects(court_id, visibility, published_at DESC);
CREATE INDEX IF NOT EXISTS builder_project_supports_project_idx
  ON builder_project_supports(project_id);
