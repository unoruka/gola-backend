ALTER TABLE `profiles` ADD `is_private` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `profiles` ADD `profile_updated_at` integer;
