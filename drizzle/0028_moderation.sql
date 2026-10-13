-- Moderation fields for automated verification pipeline
ALTER TABLE `profiles` ADD COLUMN `violation_count` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `profiles` ADD COLUMN `fake_report_count` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `profiles` ADD COLUMN `reporting_suspended` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `profiles` ADD COLUMN `post_restricted_until` integer;
