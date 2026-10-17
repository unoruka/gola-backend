-- 0031: server access model (E) + approved-build registry (H7).
-- Forward-only, additive. IF NOT EXISTS makes half-applied retries safe
-- (the runner has no transaction wrapper; see M4).
-- Mirrors client server/src/schema.ts (testers, accessLog, approvedBuilds) —
-- the two MUST be kept in sync (same table/column names and types).

-- Tester allowlist: one row per profile that may use protected actions
-- while GOLA_ACCESS_MODE=allowlist. Written only by grantTesterAccess
-- (founder); never auto-populated by signup.
CREATE TABLE IF NOT EXISTS `testers` (
  `profile_id` integer PRIMARY KEY REFERENCES `profiles`(`id`) ON DELETE CASCADE,
  `added_at` integer NOT NULL,
  `added_by` integer REFERENCES `profiles`(`id`) ON DELETE SET NULL,
  `batch_label` text
);
--> statement-breakpoint

-- Append-only operator audit log. Application code never updates/deletes rows.
CREATE TABLE IF NOT EXISTS `access_log` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `at` integer NOT NULL,
  `operator` integer REFERENCES `profiles`(`id`) ON DELETE SET NULL,
  `action` text NOT NULL,
  `target` integer REFERENCES `profiles`(`id`) ON DELETE SET NULL,
  `detail` text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `access_log_at_idx` ON `access_log` (`at`);
--> statement-breakpoint

-- Approved client builds for the H7 version gate. `status` is
-- 'approved' | 'revoked'. A client-supplied SHA is a CLAIM, not proof —
-- this table raises the bar and enables revocation of known-bad builds.
CREATE TABLE IF NOT EXISTS `approved_builds` (
  `sha` text PRIMARY KEY,
  `status` text NOT NULL DEFAULT 'approved',
  `notes` text,
  `created_at` integer NOT NULL
);
