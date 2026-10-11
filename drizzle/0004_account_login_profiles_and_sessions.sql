ALTER TABLE `profiles` ADD `email` text;
--> statement-breakpoint
ALTER TABLE `profiles` ADD `password_hash` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_email_unique` ON `profiles` (`email`);
--> statement-breakpoint
CREATE TABLE `sessions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `profile_id` integer NOT NULL,
  `token_hash` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_hash_unique` ON `sessions` (`token_hash`);