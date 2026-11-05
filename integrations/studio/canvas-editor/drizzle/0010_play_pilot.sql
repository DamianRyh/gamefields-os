CREATE TABLE `play_game_settlements` (
	`game_id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `game_players` ADD `ready_at` integer;--> statement-breakpoint
ALTER TABLE `play_court_submissions` ADD `image_url` text;--> statement-breakpoint
ALTER TABLE `play_court_submissions` ADD `review_note` text;--> statement-breakpoint
CREATE INDEX `games_sport_status_start_idx` ON `games` (`sport`,`status`,`starts_at`);--> statement-breakpoint
CREATE INDEX `home_courts_court_sport_idx` ON `home_courts` (`court_id`,`sport`);