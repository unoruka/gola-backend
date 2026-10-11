ALTER TABLE `profiles` ADD `is_founder` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
UPDATE `profiles` SET `is_founder` = 1 WHERE `handle` = 'unoruka';
