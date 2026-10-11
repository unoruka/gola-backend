// Standalone SQLite database for Gola (replaces the Muse artifact runtime DB).
// Uses bun:sqlite + drizzle-orm and auto-runs the drizzle/ migrations on boot.
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { readdirSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export const DATA_DIR =
  process.env.GOLA_DATA_DIR ?? join(import.meta.dir, "..", "data");
mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = join(DATA_DIR, "app.db");

const sqlite = new Database(DB_PATH);
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.exec("PRAGMA busy_timeout = 5000;");
// NOTE: foreign_keys intentionally left OFF (SQLite default), matching the
// managed runtime behavior — account/post deletion is done manually in code.

export const db = drizzle(sqlite);
export type StandaloneDb = typeof db;

/** Run any drizzle/*.sql migrations that have not been applied yet. */
export function runMigrations(): void {
  const dir = join(import.meta.dir, "..", "drizzle");
  sqlite.exec(
    `CREATE TABLE IF NOT EXISTS __gola_migrations (name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)`
  );
  const applied = new Set(
    (
      sqlite.query("SELECT name FROM __gola_migrations").all() as {
        name: string;
      }[]
    ).map((r) => r.name)
  );
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const f of files) {
    if (applied.has(f)) continue;
    const sql = readFileSync(join(dir, f), "utf8");
    sqlite.exec(sql);
    sqlite
      .query("INSERT INTO __gola_migrations (name, applied_at) VALUES (?, ?)")
      .run(f, Date.now());
    console.log(`[gola][migrate] applied ${f}`);
  }
}
