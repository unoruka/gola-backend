ALTER TABLE `profiles` ADD `approval_status` text NOT NULL DEFAULT 'approved';
--> statement-breakpoint
ALTER TABLE `profiles` ADD `mention_privacy` text NOT NULL DEFAULT 'everyone';
--> statement-breakpoint
ALTER TABLE `profiles` ADD `discord_user_id` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_discord_user_id_unique` ON `profiles` (`discord_user_id`);
--> statement-breakpoint
CREATE TABLE `push_tokens` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `profile_id` integer NOT NULL,
  `push_token` text NOT NULL,
  `platform` text NOT NULL DEFAULT 'android',
  `created_at` integer NOT NULL,
  FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `push_tokens_token_unique` ON `push_tokens` (`push_token`);
