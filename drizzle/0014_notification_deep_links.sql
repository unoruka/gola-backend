ALTER TABLE `notifications` ADD `comment_id` integer REFERENCES `comments`(`id`) ON DELETE cascade;
--> statement-breakpoint
ALTER TABLE `notifications` ADD `story_id` integer REFERENCES `stories`(`id`) ON DELETE cascade;
