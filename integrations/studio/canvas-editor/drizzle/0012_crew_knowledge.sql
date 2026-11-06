CREATE TABLE crew_fact_versions (
 id text PRIMARY KEY NOT NULL,
 fact_key text NOT NULL,
 version integer NOT NULL,
 discipline text NOT NULL CHECK (discipline IN ('street-football','panna-football')),
 claim text NOT NULL,
 source_1 text NOT NULL,
 source_2 text NOT NULL,
 evidence_1 text NOT NULL,
 evidence_2 text NOT NULL,
 source_checked_at integer NOT NULL,
 created_at integer NOT NULL,
 UNIQUE(fact_key, version)
);
--> statement-breakpoint
CREATE INDEX crew_fact_discipline_idx ON crew_fact_versions(discipline,created_at);
--> statement-breakpoint
CREATE TABLE crew_fact_events (
 id text PRIMARY KEY NOT NULL,
 fact_key text NOT NULL,
 version_id text,
 action text NOT NULL CHECK (action IN ('publish','withdraw','restore')),
 reason text NOT NULL,
 created_at integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX crew_fact_events_latest_idx ON crew_fact_events(fact_key,created_at DESC,id DESC);
--> statement-breakpoint
CREATE TABLE crew_ingest_runs (
 id text PRIMARY KEY NOT NULL,
 status text NOT NULL,
 discovered integer NOT NULL DEFAULT 0,
 published integer NOT NULL DEFAULT 0,
 rejected integer NOT NULL DEFAULT 0,
 report_json text NOT NULL DEFAULT '{}',
 created_at integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX crew_ingest_runs_created_idx ON crew_ingest_runs(created_at DESC);
