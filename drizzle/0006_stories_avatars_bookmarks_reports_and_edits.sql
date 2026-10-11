ALTER TABLE `profiles` ADD `avatar_blob_key` text;
--> statement-breakpoint
ALTER TABLE `posts` ADD `edited_at` integer;
--> statement-breakpoint
CREATE TABLE `stories` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `author_id` integer NOT NULL,
  `text` text,
  `blob_key` text,
  `created_at` integer NOT NULL,
  `expires_at` integer NOT NULL,
  FOREIGN KEY (`author_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `bookmarks` (
  `profile_id` integer NOT NULL,
  `post_id` integer NOT NULL,
  `created_at` integer NOT NULL,
  PRIMARY KEY (`profile_id`, `post_id`),
  FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reports` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `reporter_id` integer NOT NULL,
  `target_type` text NOT NULL,
  `target_id` integer NOT NULL,
  `reason` text NOT NULL,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`reporter_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reports_reporter_target_unique` ON `reports` (`reporter_id`,`target_type`,`target_id`);