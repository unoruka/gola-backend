CREATE TABLE `reports` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `reporter_id` integer NOT NULL REFERENCES `profiles`(`id`) ON DELETE CASCADE,
  `target_type` text NOT NULL,
  `target_id` integer NOT NULL,
  `reason` text NOT NULL,
  `details` text,
  `status` text DEFAULT 'pending' NOT NULL,
  `reviewed_at` integer,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reports_status_idx` ON `reports` (`status`);
--> statement-breakpoint
CREATE INDEX `reports_reporter_idx` ON `reports` (`reporter_id`);
