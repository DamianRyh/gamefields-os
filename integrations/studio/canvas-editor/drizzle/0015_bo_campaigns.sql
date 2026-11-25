CREATE TABLE studio_campaigns (
 id text PRIMARY KEY NOT NULL,
 project_json text NOT NULL,
 title text NOT NULL,
 place text NOT NULL,
 city text NOT NULL,
 budget_name text,
 budget_url text,
 vote_until text,
 organizer text,
 about text,
 contact_email text,
 supporters integer NOT NULL DEFAULT 0,
 approved integer NOT NULL DEFAULT 0,
 hidden integer NOT NULL DEFAULT 0,
 created_at integer NOT NULL,
 submitter_hash text NOT NULL,
 edit_key_hash text NOT NULL
);
--> statement-breakpoint
CREATE INDEX studio_campaigns_created_idx ON studio_campaigns(created_at);
--> statement-breakpoint
CREATE INDEX studio_campaigns_submitter_idx ON studio_campaigns(submitter_hash,created_at);
--> statement-breakpoint
CREATE TABLE studio_campaign_support (
 campaign_id text NOT NULL,
 voter_hash text NOT NULL,
 created_at integer NOT NULL,
 PRIMARY KEY (campaign_id,voter_hash)
);
--> statement-breakpoint
CREATE INDEX studio_campaign_support_voter_idx ON studio_campaign_support(voter_hash,created_at);
