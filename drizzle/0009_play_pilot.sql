CREATE TABLE `play_court_redesigns` (
	`id` text PRIMARY KEY NOT NULL,
	`court_id` text NOT NULL,
	`user_id` text NOT NULL,
	`sport` text NOT NULL,
	`title` text NOT NULL,
	`project` text NOT NULL,
	`status` text DEFAULT 'community' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`court_id`) REFERENCES `courts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `play_redesigns_court_idx` ON `play_court_redesigns` (`court_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `play_game_settlements` (
	`game_id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `play_redesign_votes` (
	`id` text PRIMARY KEY NOT NULL,
	`redesign_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`redesign_id`) REFERENCES `play_court_redesigns`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `play_redesign_votes_unique` ON `play_redesign_votes` (`redesign_id`,`user_id`);--> statement-breakpoint
ALTER TABLE `game_players` ADD `ready_at` integer;--> statement-breakpoint
ALTER TABLE `play_court_submissions` ADD `image_url` text;--> statement-breakpoint
ALTER TABLE `play_court_submissions` ADD `review_note` text;--> statement-breakpoint
CREATE INDEX `games_sport_status_start_idx` ON `games` (`sport`,`status`,`starts_at`);--> statement-breakpoint
CREATE INDEX `home_courts_court_sport_idx` ON `home_courts` (`court_id`,`sport`);