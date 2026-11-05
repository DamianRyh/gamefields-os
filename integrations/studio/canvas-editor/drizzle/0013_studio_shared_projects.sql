CREATE TABLE `studio_crew_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`submitter_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `studio_crew_requests_submitter_idx` ON `studio_crew_requests` (`submitter_hash`,`created_at`);--> statement-breakpoint
CREATE TABLE `studio_shared_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`project_json` text NOT NULL,
	`model_revision` text,
	`read_hash` text NOT NULL,
	`delete_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`revoked_at` integer,
	`submitter_hash` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `studio_shared_submitter_idx` ON `studio_shared_projects` (`submitter_hash`,`created_at`);
