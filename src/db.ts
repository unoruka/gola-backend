// Standalone database for Gola (replaces the Muse artifact runtime DB).
// Uses libSQL (SQLite-compatible) via Drizzle ORM, with automatic migrations.
//
// Two modes:
//   1. TURSO_DATABASE_URL set  -> connects to Turso cloud (free tier).
//      Data survives every restart/redeploy permanently.
//   2. Not set                 -> local SQLite file (ephemeral on Render free tier).
//
// Set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN in Render env vars for permanence.
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

export const DATA_DIR =
  process.env.GOLA_DATA_DIR ?? join(import.meta.dir, "..", "data");
mkdirSync(DATA_DIR, { recursive: true });

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

let client: Client;
let usingTurso = false;
if (TURSO_URL) {
  client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
  usingTurso = true;
  console.log("[gola][db] using Turso cloud database (permanent storage)");
} else {
  const DB_PATH = join(DATA_DIR, "app.db");
  client = createClient({ url: `file:${DB_PATH}` });
  console.log(
    "[gola][db] using local SQLite file (ephemeral on free hosting — set TURSO_DATABASE_URL for permanence)"
  );
}

export const db = drizzle(client);
export type StandaloneDb = typeof db;
export const isTurso = usingTurso;
/** Raw libSQL client (M4: exported for migration tests and health checks). */
export { client };

/** SQLite has no ADD COLUMN IF NOT EXISTS. For ALTER TABLE ... ADD [COLUMN]
 *  statements, skip when the column is already there — a migration that was
 *  half-applied (crash between statements, before it was recorded) can then
 *  be safely retried instead of killing the boot with "duplicate column". */
async function skipIfColumnExists(stmt: string, c: Client = client): Promise<boolean> {
  // Strip SQL line comments first: drizzle's "--> statement-breakpoint"
  // markers get glued to the following statement when we split the file,
  // which would otherwise hide the ALTER TABLE from the match below.
  const clean = stmt.replace(/--[^\n]*/g, " ");
  const m = clean.match(
    /ALTER\s+TABLE\s+[`"\[]?(\w+)[`"\]]?\s+ADD\s+(?:COLUMN\s+)?[`"\[]?(\w+)/i
  );
  if (!m) return false;
  const [, table, column] = m;
  try {
    const info = await c.execute(`PRAGMA table_info("${table}")`);
    const exists = info.rows.some(
      (r) => String((r as Record<string, unknown>).name) === column
    );
    if (exists) {
      console.log(
        `[gola][migrate] column ${table}.${column} already exists, skipping`
      );
      return true;
    }
  } catch {
    /* if we can't inspect the table, run the statement and fail loudly */
  }
  return false;
}

/** M4: skip a CREATE [UNIQUE] INDEX statement when the index already exists.
 *  Same retry-safety rationale as skipIfColumnExists: historical migrations
 *  (0002–0020, 0024) create indexes without IF NOT EXISTS, so a crash between
 *  the CREATE INDEX and the __gola_migrations bookkeeping would otherwise
 *  reboot-loop on "index already exists". */
async function skipIfIndexExists(stmt: string, c: Client = client): Promise<boolean> {
  const clean = stmt.replace(/--[^\n]*/g, " ");
  const m = clean.match(
    /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"\[]?(\w+)/i
  );
  if (!m) return false;
  const [, name] = m;
  try {
    const info = await c.execute({
      sql: `SELECT name FROM sqlite_master WHERE type = 'index' AND name = ?`,
      args: [name],
    });
    if (info.rows.length > 0) {
      console.log(`[gola][migrate] index ${name} already exists, skipping`);
      return true;
    }
  } catch {
    /* if we can't inspect the schema, run the statement and fail loudly */
  }
  return false;
}

/** M4: skip a CREATE TABLE statement when the table already exists.
 *  Same retry-safety rationale as skipIfIndexExists: historical migrations
 *  create tables without IF NOT EXISTS, so a crash between the CREATE TABLE
 *  and the __gola_migrations bookkeeping would otherwise reboot-loop on
 *  "table already exists". */
async function skipIfTableExists(stmt: string, c: Client = client): Promise<boolean> {
  const clean = stmt.replace(/--[^\n]*/g, " ");
  const m = clean.match(
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"\[]?(\w+)/i
  );
  if (!m) return false;
  const [, name] = m;
  try {
    const info = await c.execute({
      sql: `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
      args: [name],
    });
    if (info.rows.length > 0) {
      console.log(`[gola][migrate] table ${name} already exists, skipping`);
      return true;
    }
  } catch {
    /* if we can't inspect the schema, run the statement and fail loudly */
  }
  return false;
}

/** Run any drizzle/*.sql migrations that have not been applied yet.
 *
 * M4 crash-safety contract:
 * - A migration file is recorded in __gola_migrations only AFTER all of its
 *   statements succeed. If the process crashes in between (Render free-tier
 *   restarts), the next boot re-runs the whole file.
 * - Already-applied migrations are NEVER edited: their recorded names in
 *   __gola_migrations are the source of truth, including in production.
 * - To survive a re-run, every statement type this runner executes is
 *   guarded: ALTER TABLE ... ADD COLUMN (skipIfColumnExists), CREATE
 *   [UNIQUE] INDEX (skipIfIndexExists), CREATE TABLE (skipIfTableExists).
 *   A statement whose object already exists is skipped with a log line.
 *
 * Convention for FUTURE migrations: keep writing plain drizzle SQL, and
 * prefer `IF NOT EXISTS` on CREATE TABLE / CREATE INDEX where the statement
 * allows it (e.g. 0030 does this; the guards above make even bare statements
 * retry-safe — belt and suspenders). SQLite has no `ADD COLUMN IF NOT
 * EXISTS`, so ADD COLUMN relies on the runner guard. Never add a statement
 * that is not idempotent under these guards (e.g. a bare INSERT with no
 * uniqueness guard); make the migration check-then-write instead.
 *
 * @param c libSQL client to run against; defaults to the module's shared
 *   client (what the server uses). Tests pass their own scratch client so
 *   migration tests stay isolated no matter which other test files import
 *   ./db first in the same bun test process.
 */
export async function runMigrations(c: Client = client): Promise<void> {
  const { readdirSync, readFileSync } = await import("node:fs");
  const dir = join(import.meta.dir, "..", "drizzle");
  await c.execute(
    `CREATE TABLE IF NOT EXISTS __gola_migrations (name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)`
  );
  const appliedRows = await c.execute(`SELECT name FROM __gola_migrations`);
  const applied = new Set(appliedRows.rows.map((r) => String(r.name)));
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const f of files) {
    if (applied.has(f)) continue;
    const sql = readFileSync(join(dir, f), "utf8");
    // Split multi-statement files; libSQL executes one statement at a time.
    for (const stmt of sql.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean)) {
      // Skip chunks that are only comments (e.g. drizzle's trailing
      // "--> statement-breakpoint" marker).
      if (!stmt.replace(/--[^\n]*/g, "").trim()) continue;
      if (await skipIfColumnExists(stmt, c)) continue;
      // M4: the same retry-safety for CREATE INDEX / CREATE TABLE, whose
      // historical migrations lack IF NOT EXISTS (see skipIfColumnExists
      // docstring for why this matters).
      if (await skipIfIndexExists(stmt, c)) continue;
      if (await skipIfTableExists(stmt, c)) continue;
      await c.execute(stmt);
    }
    await c.execute({
      sql: "INSERT INTO __gola_migrations (name, applied_at) VALUES (?, ?)",
      args: [f, Date.now()],
    });
    console.log(`[gola][migrate] applied ${f}`);
  }
}
