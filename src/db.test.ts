// M4 tests: migration runner crash-safety.
//
// runMigrations() records a file only AFTER all its statements succeed. A
// crash in between (Render free-tier restart) re-runs the whole file on next
// boot; the runner must skip CREATE TABLE / CREATE INDEX statements whose
// objects already exist instead of dying with "already exists" (boot loop).
//
// Each test uses a scratch GOLA_DATA_DIR so the real data dir is untouched.
import { describe, expect, test } from "bun:test";
import { mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SCRATCH = mkdtempSync(join(tmpdir(), "gola-m4-test-"));
// This test deliberately does NOT use the shared ./db module client: other
// test files (e.g. serverGuards.test.ts) import ./server.ts in-process,
// which pins the shared module client to THEIR scratch database at import
// time. A dedicated client keeps these migration tests isolated regardless
// of bun test's file execution order.
import { createClient } from "@libsql/client";
const client = createClient({ url: `file:${join(SCRATCH, "m4-test.db")}` });

const { runMigrations } = await import("./db");

const MIGRATION_FILES = readdirSync(join(import.meta.dir, "..", "drizzle")).filter(
  (f) => f.endsWith(".sql")
);

async function appliedCount(): Promise<number> {
  const rows = await client.execute(`SELECT COUNT(*) AS n FROM __gola_migrations`);
  return Number(rows.rows[0].n);
}

describe("M4 migration crash-safety", () => {
  test("fresh database: all migrations apply cleanly", async () => {
    await runMigrations(client);
    expect(await appliedCount()).toBe(MIGRATION_FILES.length);
  });

  test("second run is a no-op and succeeds", async () => {
    await runMigrations(client);
    expect(await appliedCount()).toBe(MIGRATION_FILES.length);
  });

  test("crash-retry: unrecorded-but-applied files re-run without 'already exists' errors", async () => {
    // Seed a probe row so we can prove user data survives the retry.
    await client.execute({
      sql: `INSERT INTO rate_limits ("key", window_start, "count") VALUES (?, ?, ?)`,
      args: ["m4-probe", 1, 1],
    });
    // Simulate a crash: bookkeeping lost for files whose statements (bare
    // CREATE TABLE / CREATE INDEX, no IF NOT EXISTS) already ran.
    await client.execute(
      `DELETE FROM __gola_migrations WHERE name IN ('0002_social_accounts_posts_interactions.sql', '0024_collections.sql', '0030_rate_limits.sql')`
    );
    expect(await appliedCount()).toBe(MIGRATION_FILES.length - 3);

    // Before the M4 fix this threw `table collections already exists`
    // (and `index ... already exists` for the CREATE INDEX statements),
    // boot-looping the server on every restart.
    await runMigrations(client);

    expect(await appliedCount()).toBe(MIGRATION_FILES.length);
    // Data survived: the retry skipped existing objects instead of rebuilding.
    const probe = await client.execute({
      sql: `SELECT "count" AS c FROM rate_limits WHERE "key" = ?`,
      args: ["m4-probe"],
    });
    expect(probe.rows.length).toBe(1);
    // Indexes from the retried files exist exactly once.
    const idx = await client.execute(
      `SELECT name FROM sqlite_master WHERE type = 'index' AND name IN ('idx_collections_profile', 'profiles_handle_unique')`
    );
    expect(idx.rows.length).toBe(2);
  });
});
