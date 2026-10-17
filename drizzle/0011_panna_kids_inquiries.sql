CREATE TABLE panna_kids_inquiries (
  id TEXT PRIMARY KEY NOT NULL,
  submission_id TEXT NOT NULL UNIQUE,
  payload_hash TEXT NOT NULL,
  configuration_json TEXT NOT NULL,
  contact_json TEXT NOT NULL,
  commercial_snapshot_json TEXT NOT NULL,
  catalogue_version INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  created_at INTEGER NOT NULL
);
CREATE INDEX panna_kids_inquiries_created_at ON panna_kids_inquiries (created_at);
