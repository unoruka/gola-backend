-- 0022: durable blob storage in Turso.
--
-- Render's free-tier filesystem is ephemeral: every deploy/restart wipes
-- <data>/blobs, so all uploaded avatars and post photos were lost on each
-- backend update. Blobs now live in this table (Turso = permanent), served
-- at the same /blobs/<key> URLs, so no client change is needed.
CREATE TABLE IF NOT EXISTS `blobs` (
  `key` TEXT PRIMARY KEY,
  `data` BLOB NOT NULL,
  `content_type` TEXT NOT NULL,
  `size` INTEGER NOT NULL,
  `created_at` INTEGER NOT NULL
);
