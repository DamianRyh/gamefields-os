ALTER TABLE studio_workshop_designs ADD COLUMN nickname text;
--> statement-breakpoint
ALTER TABLE studio_workshop_designs ADD COLUMN social_consent integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE studio_workshop_designs ADD COLUMN contest text;
--> statement-breakpoint
ALTER TABLE studio_workshop_designs ADD COLUMN likes integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE studio_workshop_designs ADD COLUMN remixes integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE studio_workshop_designs ADD COLUMN featured text;
--> statement-breakpoint
ALTER TABLE studio_workshop_designs ADD COLUMN hidden integer NOT NULL DEFAULT 0;
--> statement-breakpoint
CREATE INDEX studio_workshop_contest_idx ON studio_workshop_designs(contest,likes);
--> statement-breakpoint
CREATE TABLE studio_workshop_votes (
 design_id text NOT NULL,
 voter_hash text NOT NULL,
 kind text NOT NULL,
 created_at integer NOT NULL,
 PRIMARY KEY (design_id,voter_hash,kind)
);
--> statement-breakpoint
CREATE INDEX studio_workshop_votes_voter_idx ON studio_workshop_votes(voter_hash,kind,created_at);
