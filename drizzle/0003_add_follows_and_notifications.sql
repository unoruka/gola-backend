CREATE TABLE `follows` (
  `follower_id` integer NOT NULL,
  `following_id` integer NOT NULL,
  `created_at` integer NOT NULL,
  PRIMARY KEY(`follower_id`, `following_id`),
  FOREIGN KEY (`follower_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`following_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `notifications` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `recipient_id` integer NOT NULL,
  `actor_id` integer NOT NULL,
  `type` text NOT NULL,
  `post_id` integer,
  `read_at` integer,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`recipient_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`actor_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_recipient_created_idx` ON `notifications` (`recipient_id`, `created_at`);
