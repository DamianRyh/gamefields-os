CREATE TABLE studio_workshop_designs (
 id text PRIMARY KEY NOT NULL,
 title text NOT NULL,
 project_json text NOT NULL,
 created_at integer NOT NULL,
 submitter_hash text NOT NULL,
 fingerprint text NOT NULL UNIQUE,
 delete_key_hash text NOT NULL
);
--> statement-breakpoint
CREATE INDEX studio_workshop_created_idx ON studio_workshop_designs(created_at);
--> statement-breakpoint
CREATE INDEX studio_workshop_submitter_idx ON studio_workshop_designs(submitter_hash,created_at);
