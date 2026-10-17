// E: server-enforced access model — HTTP gate + approved-build check.
//
// Two halves:
//   1. The MODE GATE (pure functions, no imports, no DB, zero writes —
//      mirrors maintenance.ts): `closed` rejects everything except
//      GET /health; `allowlist` passes through (enforced per-action in the
//      actions layer via approvedProfile); `open` (default) is today's
//      behavior. The maintenance gate always runs FIRST — maintenance
//      takes precedence over every mode here.
//   2. The APPROVED-BUILD CHECK (H7, needs the DB): when
//      GOLA_REQUIRE_APPROVED_BUILD=1, the /actions envelope must carry an
//      `appCommit` present in the approved_builds table with
//      status='approved', or the caller must present a founder session
//      (break-glass). Old clients that send no appCommit are rejected only
//      while enforcement is on (default OFF).
//
// Design honesty (documented limitations):
//  - A client-supplied SHA is a CLAIM, not proof. A custom client can send
//    any approved SHA. This raises the bar (kills accidental old builds,
//    enables instant revocation of known-bad builds); it is not attestation.
//    Play Integrity API is the future strong option.
//  - The gate never deletes or modifies accounts, sessions, recovery keys,
//    or user data. Restrictions only reject requests.
//  - A misconfiguration cannot permanently lock out the founder: the
//    founder bypasses the build gate via isFounder, and flipping
//    GOLA_ACCESS_MODE / GOLA_REQUIRE_APPROVED_BUILD in the Render
//    dashboard restores access (see the rollout doc runbook).

export type AccessMode = "open" | "allowlist" | "closed";

/**
 * Resolve the access mode. DEFAULT IS SAFE: unset (or "open") behaves
 * exactly as before this change. An unrecognized value fails CLOSED and
 * loud — a typo must lock everyone out visibly, never silently disable
 * the protection the operator asked for.
 */
export function accessMode(env: NodeJS.ProcessEnv = process.env): AccessMode {
  const raw = (env.GOLA_ACCESS_MODE ?? "").trim().toLowerCase();
  if (raw === "" || raw === "open") return "open";
  if (raw === "allowlist" || raw === "closed") return raw;
  return "closed";
}

/** False when GOLA_ACCESS_MODE is set to something unrecognized. */
export function isAccessModeRecognized(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = (env.GOLA_ACCESS_MODE ?? "").trim().toLowerCase();
  return raw === "" || raw === "open" || raw === "allowlist" || raw === "closed";
}

export const CLOSED_MESSAGE_DEFAULT =
  "Gola is in a private testing phase right now. Please check back soon.";

export function closedMessage(env: NodeJS.ProcessEnv = process.env): string {
  return env.GOLA_ACCESS_CLOSED_MESSAGE ?? CLOSED_MESSAGE_DEFAULT;
}

/**
 * Returns a 503 Response when the request must be blocked, or null when it
 * may proceed. Only `closed` blocks (everything except GET /health);
 * `allowlist` is enforced per-action downstream, so the gate passes it.
 * `method`/`pathname` come from the incoming request; `env` defaults to
 * process.env so tests can inject values.
 */
export function accessGate(
  method: string,
  pathname: string,
  opts: { env?: NodeJS.ProcessEnv; headers?: HeadersInit } = {}
): Response | null {
  const env = opts.env ?? process.env;
  if (accessMode(env) !== "closed") return null;
  if (method === "GET" && pathname === "/health") return null;
  return Response.json(
    { error: closedMessage(env) },
    { status: 503, headers: opts.headers }
  );
}

// ---------------------------------------------------------------------------
// Approved-build enforcement (H7).
// ---------------------------------------------------------------------------

/** Exact "1" enables the build gate — same convention as GOLA_MAINTENANCE. */
export function versionEnforcementEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.GOLA_REQUIRE_APPROVED_BUILD === "1";
}

export const APP_UPDATE_REQUIRED = "APP_UPDATE_REQUIRED";

/**
 * Session-token hash, byte-identical to the actions bundle's sha256()
 * (base64 of the raw SHA-256 digest) — sessions.token_hash is looked up
 * with this. Pinned by a test vector in access.test.ts; if the bundle's
 * hash format ever changes, this MUST change with it.
 */
export async function sessionTokenHash(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const bytes = new Uint8Array(digest);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

/** Structural type for the raw libSQL client (db.$client). Only execute. */
export interface BuildCheckClient {
  execute: (stmt: { sql: string; args: unknown[] }) => Promise<{ rows: unknown[] }>;
}

export type BuildVerdict =
  | { ok: true }
  | { ok: false; code: typeof APP_UPDATE_REQUIRED; message: string };

/**
 * Decide whether an /actions call may proceed under build enforcement.
 * `appCommit` is the envelope's claimed build SHA; `sessionToken` is the
 * envelope args' token (used only for the founder break-glass).
 */
export async function checkAppBuild(
  client: BuildCheckClient,
  appCommit: unknown,
  sessionToken: unknown
): Promise<BuildVerdict> {
  const sha = typeof appCommit === "string" ? appCommit.trim() : "";
  if (sha.length >= 7 && sha.length <= 100) {
    const res = await client.execute({
      sql: "SELECT status FROM approved_builds WHERE sha = ? LIMIT 1",
      args: [sha],
    });
    const row = (res.rows[0] ?? null) as { status?: unknown } | null;
    if (row?.status === "approved") return { ok: true };
  }
  // Break-glass: a live founder session bypasses the build gate, so a
  // misconfiguration (or a bad revocation) can never lock Ruka out.
  // Only the session's profile row is read; nothing is written.
  if (typeof sessionToken === "string" && sessionToken.length > 0) {
    try {
      const res = await client.execute({
        sql: `SELECT p.is_founder AS isFounder FROM sessions s
              JOIN profiles p ON p.id = s.profile_id
              WHERE s.token_hash = ? AND s.expires_at > ? LIMIT 1`,
        args: [await sessionTokenHash(sessionToken), Date.now()],
      });
      const row = (res.rows[0] ?? null) as { isFounder?: unknown } | null;
      if (row && (row.isFounder === 1 || row.isFounder === true)) {
        console.log("[gola][access] approved-build gate bypassed by founder session");
        return { ok: true };
      }
    } catch {
      // A DB error here must not become a bypass: fall through to reject.
    }
  }
  return {
    ok: false,
    code: APP_UPDATE_REQUIRED,
    message:
      "APP_UPDATE_REQUIRED: This version of Gola is no longer supported. Please update to the latest build.",
  };
}
