ALTER TABLE `profiles` ADD `language` text DEFAULT 'en' NOT NULL;
--> statement-breakpoint
ALTER TABLE `profiles` ADD `region` text DEFAULT 'global' NOT NULL;