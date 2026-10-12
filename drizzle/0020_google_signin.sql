ALTER TABLE `profiles` ADD `google_sub` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_google_sub_unique` ON `profiles` (`google_sub`);
