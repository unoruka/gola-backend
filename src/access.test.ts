// S2 backend access-control tests: E (mode gate) + H7 (approved-build gate).
// Run: bun test src/access.test.ts
//
// - Pure gate tests (no server boot): accessMode/accessGate/closedMessage,
//   versionEnforcementEnabled, sessionTokenHash (pinned vector).
// - checkAppBuild against a REAL libSQL database with the real 0031 tables.
// - HTTP integration: the REAL server is spawned as a subprocess per
//   scenario (own port + data dir), proving gate ORDER (maintenance first),
//   the closed/allowlist behavior, the relay state passthrough, and the
//   version gate over the wire.
import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@libsql/client";
import {
  accessMode,
  isAccessModeRecognized,
  accessGate,
  closedMessage,
  CLOSED_MESSAGE_DEFAULT,
  versionEnforcementEnabled,
  checkAppBuild,
  sessionTokenHash,
  APP_UPDATE_REQUIRED,
  type BuildCheckClient,
} from "./access.js";

// ---------------------------------------------------------------------------
// Pure gate tests
// ---------------------------------------------------------------------------

describe("E accessMode()", () => {
  test("unset defaults to open (today's behavior)", () => {
    expect(accessMode({} as NodeJS.ProcessEnv)).toBe("open");
    expect(isAccessModeRecognized({} as NodeJS.ProcessEnv)).toBe(true);
  });
  test("open / allowlist / closed, case- and whitespace-tolerant", () => {
    expect(accessMode({ GOLA_ACCESS_MODE: "open" } as NodeJS.ProcessEnv)).toBe("open");
    expect(accessMode({ GOLA_ACCESS_MODE: "  AllowList " } as NodeJS.ProcessEnv)).toBe("allowlist");
    expect(accessMode({ GOLA_ACCESS_MODE: "CLOSED" } as NodeJS.ProcessEnv)).toBe("closed");
  });
  test("unrecognized value fails closed", () => {
    const env = { GOLA_ACCESS_MODE: "allowlsit" } as NodeJS.ProcessEnv;
    expect(accessMode(env)).toBe("closed");
    expect(isAccessModeRecognized(env)).toBe(false);
  });
});

describe("E accessGate()", () => {
  test("open: everything passes", () => {
    expect(accessGate("POST", "/actions", { env: {} as NodeJS.ProcessEnv })).toBeNull();
  });
  test("allowlist: passes at the gate (enforced per-action downstream)", () => {
    const env = { GOLA_ACCESS_MODE: "allowlist" } as NodeJS.ProcessEnv;
    expect(accessGate("POST", "/actions", { env })).toBeNull();
  });
  test("closed: blocks everything except GET /health, distinct message", async () => {
    const env = { GOLA_ACCESS_MODE: "closed" } as NodeJS.ProcessEnv;
    expect(accessGate("GET", "/health", { env })).toBeNull();
    for (const [m, p] of [["POST", "/actions"], ["GET", "/oauth/discord"], ["GET", "/blobs/x"], ["GET", "/u/x"]] as const) {
      const r = accessGate(m, p, { env })!;
      expect(r).not.toBeNull();
      expect(r.status).toBe(503);
      const body = await r.json();
      expect(body.error).toBe(CLOSED_MESSAGE_DEFAULT);
      expect(body.error).not.toContain("being updated");
    }
  });
  test("closed: custom message via GOLA_ACCESS_CLOSED_MESSAGE", async () => {
    const env = { GOLA_ACCESS_MODE: "closed", GOLA_ACCESS_CLOSED_MESSAGE: "Custom closed." } as NodeJS.ProcessEnv;
    expect(closedMessage(env)).toBe("Custom closed.");
    const r = accessGate("POST", "/actions", { env })!;
    expect((await r.json()).error).toBe("Custom closed.");
  });
});

describe("versionEnforcementEnabled()", () => {
  test("only exact \"1\" enables; default off", () => {
    expect(versionEnforcementEnabled({} as NodeJS.ProcessEnv)).toBe(false);
    expect(versionEnforcementEnabled({ GOLA_REQUIRE_APPROVED_BUILD: "1" } as NodeJS.ProcessEnv)).toBe(true);
    expect(versionEnforcementEnabled({ GOLA_REQUIRE_APPROVED_BUILD: "true" } as NodeJS.ProcessEnv)).toBe(false);
  });
});

describe("sessionTokenHash()", () => {
  test("pinned vector matches the actions bundle's sha256 format", async () => {
    // If the bundle's session-hash format ever changes, this MUST change
    // with it (backend/src/access.ts documents the coupling).
    expect(await sessionTokenHash("gola-test-vector")).toBe(
      "QpD7s2iz/s5x5N8h4sew9d2TNaw5CD7Dm51qv3WS/UM="
    );
  });
});

// ---------------------------------------------------------------------------
// checkAppBuild against a real database
// ---------------------------------------------------------------------------

const BUILD_DDL = `
CREATE TABLE profiles (
  id integer primary key autoincrement, display_name text not null,
  handle text not null, is_founder integer not null default 0,
  created_at integer not null
);
CREATE TABLE sessions (
  id integer primary key autoincrement,
  profile_id integer not null references profiles(id) on delete cascade,
  token_hash text not null, expires_at integer not null, created_at integer not null
);
CREATE TABLE approved_builds (
  sha text primary key, status text not null default 'approved',
  notes text, created_at integer not null
);
`;

let dir: string;
let client: BuildCheckClient;

beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), "be-access-"));
  const raw = createClient({ url: `file:${join(dir, "t.db")}` });
  for (const stmt of BUILD_DDL.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean)) {
    await raw.execute(stmt);
  }
  client = raw as unknown as BuildCheckClient;
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

async function seedBuild(sha: string, status: string) {
  await (client as unknown as { execute: (s: string) => Promise<unknown> }).execute(
    `INSERT INTO approved_builds (sha, status, created_at) VALUES ('${sha}', '${status}', ${Date.now()})`
  );
}

async function seedFounderSession(token: string, expired = false): Promise<void> {
  const raw = client as unknown as { execute: (s: string | { sql: string; args: unknown[] }) => Promise<unknown> };
  await raw.execute(`INSERT INTO profiles (display_name, handle, is_founder, created_at) VALUES ('F', 'founder', 1, ${Date.now()})`);
  const hash = await sessionTokenHash(token);
  const exp = expired ? Date.now() - 1000 : Date.now() + 86_400_000;
  await raw.execute({
    sql: "INSERT INTO sessions (profile_id, token_hash, expires_at, created_at) VALUES (1, ?, ?, ?)",
    args: [hash, exp, Date.now()],
  });
}

describe("checkAppBuild()", () => {
  test("approved SHA passes", async () => {
    await seedBuild("abc1234", "approved");
    expect(await checkAppBuild(client, "abc1234", undefined)).toEqual({ ok: true });
  });
  test("unknown SHA rejected with APP_UPDATE_REQUIRED", async () => {
    const v = await checkAppBuild(client, "nope000", undefined);
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.code).toBe(APP_UPDATE_REQUIRED);
      expect(v.message).toContain(APP_UPDATE_REQUIRED);
    }
  });
  test("revoked SHA rejected", async () => {
    await seedBuild("bad9999", "revoked");
    expect((await checkAppBuild(client, "bad9999", undefined)).ok).toBe(false);
  });
  test("missing appCommit rejected (old client, enforcement on)", async () => {
    expect((await checkAppBuild(client, undefined, undefined)).ok).toBe(false);
    expect((await checkAppBuild(client, "", undefined)).ok).toBe(false);
  });
  test("founder session bypasses (break-glass)", async () => {
    await seedFounderSession("founder-raw-token");
    expect(await checkAppBuild(client, undefined, "founder-raw-token")).toEqual({ ok: true });
    expect(await checkAppBuild(client, "unknown-sha", "founder-raw-token")).toEqual({ ok: true });
  });
  test("non-founder session does NOT bypass; expired founder session does NOT bypass", async () => {
    const raw = client as unknown as { execute: (s: string | { sql: string; args: unknown[] }) => Promise<unknown> };
    await raw.execute(`INSERT INTO profiles (display_name, handle, created_at) VALUES ('P', 'plain', ${Date.now()})`);
    const hash = await sessionTokenHash("plain-raw");
    await raw.execute({
      sql: "INSERT INTO sessions (profile_id, token_hash, expires_at, created_at) VALUES (1, ?, ?, ?)",
      args: [hash, Date.now() + 86_400_000, Date.now()],
    });
    expect((await checkAppBuild(client, undefined, "plain-raw")).ok).toBe(false);

    await seedFounderSession("expired-founder", true);
    expect((await checkAppBuild(client, undefined, "expired-founder")).ok).toBe(false);
  });
  test("garbage token does not bypass and does not throw", async () => {
    expect((await checkAppBuild(client, undefined, "garbage")).ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// HTTP integration: real server subprocess per scenario
// ---------------------------------------------------------------------------

const BACKEND_DIR = new URL(".", import.meta.url).pathname.replace(/\/src\/$/, "");
let httpDir: string;

function waitForHealth(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 20_000;
    const tick = async () => {
      try {
        const r = await fetch(`http://127.0.0.1:${port}/health`);
        if (r.ok) return resolve();
      } catch { /* not up yet */ }
      if (Date.now() > deadline) return reject(new Error("server did not boot"));
      setTimeout(tick, 150);
    };
    tick();
  });
}

async function withServer(
  env: Record<string, string>,
  fn: (port: number, dataDir: string) => Promise<void>
): Promise<void> {
  httpDir = mkdtempSync(join(tmpdir(), "be-http-"));
  const port = 18800 + Math.floor(Math.random() * 700); // avoid 18787 (serverGuards.test.ts)
  const proc = Bun.spawn(["bun", "src/server.ts"], {
    cwd: BACKEND_DIR || ".",
    env: { ...process.env, PORT: String(port), GOLA_DATA_DIR: join(httpDir, "data"), ...env },
    stdout: "ignore",
    stderr: "ignore",
  });
  try {
    await waitForHealth(port);
    await fn(port, join(httpDir, "data"));
  } finally {
    proc.kill();
    await proc.exited;
    rmSync(httpDir, { recursive: true, force: true });
  }
}

async function postActions(port: number, body: unknown) {
  const r = await fetch(`http://127.0.0.1:${port}/actions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: r.status, json: await r.json().catch(() => null) as { error?: string; code?: string } | null };
}

describe("HTTP: gate order + modes", () => {
  test("maintenance wins over closed (503 maintenance message)", async () => {
    await withServer({ GOLA_MAINTENANCE: "1", GOLA_ACCESS_MODE: "closed" }, async (port) => {
      const { status, json } = await postActions(port, { action: "nope", args: {} });
      expect(status).toBe(503);
      expect(json?.error).toContain("being updated");
    });
  });

  test("closed mode: /actions 503 with the closed message; /health 200", async () => {
    await withServer({ GOLA_ACCESS_MODE: "closed" }, async (port) => {
      const { status, json } = await postActions(port, { action: "nope", args: {} });
      expect(status).toBe(503);
      expect(json?.error).toBe(CLOSED_MESSAGE_DEFAULT);
      const h = await fetch(`http://127.0.0.1:${port}/health`);
      expect(h.status).toBe(200);
    });
  });

  test("allowlist mode: gate passes through (per-action enforcement is downstream)", async () => {
    await withServer({ GOLA_ACCESS_MODE: "allowlist" }, async (port) => {
      const { status } = await postActions(port, { action: "nope", args: {} });
      expect(status).toBe(404); // reached dispatch: unknown action
    });
  });

  test("open (default): unchanged behavior", async () => {
    await withServer({}, async (port) => {
      const { status } = await postActions(port, { action: "nope", args: {} });
      expect(status).toBe(404);
    });
  });

  test("M1: /oauth/discord relay carries state through to the deep link", async () => {
    await withServer({}, async (port) => {
      const r = await fetch(`http://127.0.0.1:${port}/oauth/discord?code=CODE123&state=v1.1.abc.def`);
      const html = await r.text();
      expect(html).toContain("gola://oauth/discord?code=CODE123&amp;state=v1.1.abc.def");
      // error path also carries state
      const r2 = await fetch(`http://127.0.0.1:${port}/oauth/discord?error=access_denied&state=v1.2.ghi.jkl`);
      expect(await r2.text()).toContain("error=access_denied&amp;state=v1.2.ghi.jkl");
    });
  });
});

describe("HTTP: approved-build gate", () => {
  test("enforcement off (default): no appCommit needed", async () => {
    await withServer({}, async (port) => {
      const { status } = await postActions(port, { action: "nope", args: {} });
      expect(status).toBe(404);
    });
  });

  test("enforcement on: missing/unknown/revoked -> 426 APP_UPDATE_REQUIRED; approved -> dispatch", async () => {
    await withServer({ GOLA_REQUIRE_APPROVED_BUILD: "1" }, async (port, dataDir) => {
      const raw = createClient({ url: `file:${join(dataDir, "app.db")}` });
      const now = Date.now();
      await raw.execute(`INSERT INTO approved_builds (sha, status, created_at) VALUES ('goodsha1', 'approved', ${now})`);
      await raw.execute(`INSERT INTO approved_builds (sha, status, created_at) VALUES ('badsha99', 'revoked', ${now})`);

      let r = await postActions(port, { action: "nope", args: {} });
      expect(r.status).toBe(426);
      expect(r.json?.code).toBe(APP_UPDATE_REQUIRED);

      r = await postActions(port, { action: "nope", args: {}, appCommit: "unknownsha" });
      expect(r.status).toBe(426);

      r = await postActions(port, { action: "nope", args: {}, appCommit: "badsha99" });
      expect(r.status).toBe(426);

      r = await postActions(port, { action: "nope", args: {}, appCommit: "goodsha1" });
      expect(r.status).toBe(404); // passed the gate, reached dispatch
    });
  });

  test("enforcement on: founder session bypasses (break-glass over HTTP)", async () => {
    await withServer({ GOLA_REQUIRE_APPROVED_BUILD: "1" }, async (port, dataDir) => {
      const raw = createClient({ url: `file:${join(dataDir, "app.db")}` });
      const now = Date.now();
      await raw.execute(`INSERT INTO profiles (display_name, handle, is_founder, approval_status, created_at) VALUES ('F', 'founderx', 1, 'approved', ${now})`);
      const hash = await sessionTokenHash("founder-http-token");
      await raw.execute({
        sql: "INSERT INTO sessions (profile_id, token_hash, expires_at, created_at) VALUES (1, ?, ?, ?)",
        args: [hash, now + 86_400_000, now],
      });
      const r = await postActions(port, { action: "nope", args: { token: "founder-http-token" } });
      expect(r.status).toBe(404); // bypassed the gate, reached dispatch
    });
  });
});
