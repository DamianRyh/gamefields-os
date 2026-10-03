CREATE TABLE `play_accounts` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `email` text NOT NULL,
  `password_hash` text NOT NULL,
  `password_salt` text NOT NULL,
  `password_version` integer DEFAULT 1 NOT NULL,
  `failed_attempts` integer DEFAULT 0 NOT NULL,
  `locked_until` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `play_accounts_email_unique` ON `play_accounts` (`email`);
--> statement-breakpoint
CREATE UNIQUE INDEX `play_accounts_user_unique` ON `play_accounts` (`user_id`);
--> statement-breakpoint
CREATE TABLE `play_sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `token_hash` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer NOT NULL,
  `last_seen_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `play_sessions_token_unique` ON `play_sessions` (`token_hash`);
