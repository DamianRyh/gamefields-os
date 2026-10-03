CREATE TABLE `play_availability` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `sport` text NOT NULL,
  `court_id` text,
  `available_until` integer NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`court_id`) REFERENCES `courts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `play_availability_user_sport_unique` ON `play_availability` (`user_id`,`sport`);
