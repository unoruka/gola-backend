-- F-2 Stage 2a: recovery-key acknowledgement timestamp.
-- NULL = key never acknowledged (legacy email+handle reset stays open).
-- Cleared to NULL on every key rotation. No backfill needed.
ALTER TABLE `profiles` ADD COLUMN `recovery_code_acked_at` integer;
