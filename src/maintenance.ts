// Temporary maintenance gate (approved 2026-10-16; local only).
//
// When the GOLA_MAINTENANCE environment variable is exactly "1", every
// request except GET /health is answered with 503 and a plain message.
// There is no shared secret and no bypass: testing uses Ruka-initiated
// toggle windows (env off -> test -> env on).
//
// This module is intentionally side-effect free: it imports nothing,
// touches no database, and performs zero writes. It cannot modify
// accounts, sessions, recovery keys, or any data — it only decides whether
// a request may proceed to the real route handlers.

export const MAINTENANCE_MESSAGE_DEFAULT =
  "Gola is being updated. A new version is coming soon.";

export function isMaintenanceMode(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  return env.GOLA_MAINTENANCE === "1";
}

export function maintenanceMessage(
  env: NodeJS.ProcessEnv = process.env
): string {
  return env.GOLA_MAINTENANCE_MESSAGE ?? MAINTENANCE_MESSAGE_DEFAULT;
}

/**
 * Returns a 503 Response when the request must be blocked, or null when it
 * may proceed. `method`/`pathname` come from the incoming request; `env`
 * defaults to process.env so tests can inject values.
 */
export function maintenanceGate(
  method: string,
  pathname: string,
  opts: { env?: NodeJS.ProcessEnv; headers?: HeadersInit } = {}
): Response | null {
  const env = opts.env ?? process.env;
  if (!isMaintenanceMode(env)) return null;
  if (method === "GET" && pathname === "/health") return null;
  return Response.json(
    { error: maintenanceMessage(env) },
    { status: 503, headers: opts.headers }
  );
}
