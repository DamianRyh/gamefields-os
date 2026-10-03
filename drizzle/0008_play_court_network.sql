CREATE TABLE `play_court_submissions` (
  `id` text PRIMARY KEY NOT NULL,
  `submitter_user_id` text NOT NULL,
  `name` text NOT NULL,
  `city` text DEFAULT 'Warszawa' NOT NULL,
  `district` text,
  `address` text,
  `latitude` real NOT NULL,
  `longitude` real NOT NULL,
  `sports` text NOT NULL,
  `surface` text,
  `lighting` integer DEFAULT 0 NOT NULL,
  `is_free` integer DEFAULT 1 NOT NULL,
  `notes` text,
  `status` text DEFAULT 'pending' NOT NULL,
  `published_court_id` text,
  `reviewed_by_user_id` text,
  `reviewed_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`submitter_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `play_court_submissions_status_idx` ON `play_court_submissions` (`status`,`created_at`);
--> statement-breakpoint
CREATE INDEX `play_court_submissions_submitter_idx` ON `play_court_submissions` (`submitter_user_id`,`created_at`);
