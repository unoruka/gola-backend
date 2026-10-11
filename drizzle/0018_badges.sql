ALTER TABLE `profiles` ADD `badge` text NOT NULL DEFAULT 'none';
--> statement-breakpoint
UPDATE `profiles` SET `is_founder` = 1 WHERE `handle` = 'gola';
