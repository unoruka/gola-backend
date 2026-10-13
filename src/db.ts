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

/** SQLite has no ADD COLUMN IF NOT EXISTS. For ALTER TABLE ... ADD [COLUMN]
 *  statements, skip when the column is already there — a migration that was
 *  half-applied (crash between statements, before it was recorded) can then
 *  be safely retried instead of killing the boot with "duplicate column". */
async function skipIfColumnExists(stmt: string): Promise<boolean> {
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
    const info = await client.execute(`PRAGMA table_info("${table}")`);
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

/** Run any drizzle/*.sql migrations that have not been applied yet. */
export async function runMigrations(): Promise<void> {
  const { readdirSync, readFileSync } = await import("node:fs");
  const dir = join(import.meta.dir, "..", "drizzle");
  await client.execute(
    `CREATE TABLE IF NOT EXISTS __gola_migrations (name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)`
  );
  const appliedRows = await client.execute(`SELECT name FROM __gola_migrations`);
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
      if (await skipIfColumnExists(stmt)) continue;
      await client.execute(stmt);
    }
    await client.execute({
      sql: "INSERT INTO __gola_migrations (name, applied_at) VALUES (?, ?)",
      args: [f, Date.now()],
    });
    console.log(`[gola][migrate] applied ${f}`);
  }
}
