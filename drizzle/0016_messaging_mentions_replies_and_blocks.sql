ALTER TABLE `comments` ADD `parent_comment_id` integer;
--> statement-breakpoint
ALTER TABLE `notifications` ADD `conversation_id` integer;
--> statement-breakpoint
CREATE TABLE `conversations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_low_id` integer NOT NULL,
  `user_high_id` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`user_low_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`user_high_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `conversations_pair_unique` ON `conversations` (`user_low_id`,`user_high_id`);
--> statement-breakpoint
CREATE TABLE `messages` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `conversation_id` integer NOT NULL,
  `sender_id` integer NOT NULL,
  `text` text NOT NULL,
  `read_at` integer,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`sender_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `blocks` (
  `blocker_id` integer NOT NULL,
  `blocked_id` integer NOT NULL,
  `created_at` integer NOT NULL,
  PRIMARY KEY (`blocker_id`,`blocked_id`),
  FOREIGN KEY (`blocker_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`blocked_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);