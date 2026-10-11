ALTER TABLE `profiles` ADD `theme_color` text DEFAULT 'teal' NOT NULL;
--> statement-breakpoint
ALTER TABLE `profiles` ADD `theme_changed_at` integer;