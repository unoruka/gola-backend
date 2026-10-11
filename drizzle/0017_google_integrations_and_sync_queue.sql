CREATE TABLE `google_integrations` (
  `id` integer PRIMARY KEY NOT NULL,
  `sheets_enabled` integer DEFAULT false NOT NULL,
  `spreadsheet_id` text,
  `spreadsheet_url` text,
  `drive_file_url` text,
  `connected_at` integer,
  `last_sync_at` integer,
  `last_error` text,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `google_sync_queue` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `tab` text NOT NULL,
  `record_key` text NOT NULL,
  `operation` text NOT NULL,
  `payload` text NOT NULL,
  `status` text DEFAULT 'pending' NOT NULL,
  `error` text,
  `created_at` integer NOT NULL,
  `synced_at` integer
);
--> statement-breakpoint
CREATE INDEX `google_sync_queue_status_idx` ON `google_sync_queue` (`status`);
