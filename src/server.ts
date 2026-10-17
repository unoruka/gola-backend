// Gola standalone backend — Bun HTTP server.
//
//   POST /actions   {action, args} -> dispatch to compiled actions (./dist/actions.js)
//   GET  /blobs/*   serve uploaded files (avatars, post photos, story images)
//   GET  /health    liveness probe
//
// Response envelope matches what the SDK client expects:
//   200 {data} on success, {error} with 4xx/5xx on failure.
import { Actions } from "../dist/actions.js";
// Local copy of the SDK's isAction check (brand string is the stable contract
// between independently bundled copies). Avoids shipping the 2MB SDK tarball.
const ACTION_BRAND = "@hatch/space-sdk/action/v1";
function isAction(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return "__brand" in v && v.__brand === ACTION_BRAND;
}
import { createCtx } from "./ctx";
import { runMigrations } from "./db";
import { blobStore } from "./blobs";
import { maintenanceGate } from "./maintenance";
import { accessGate, accessMode, isAccessModeRecognized, versionEnforcementEnabled, checkAppBuild } from "./access";

await runMigrations();

type ActionDef = {
  request: { parseAsync: (v: unknown) => Promise<unknown> };
  response: { parseAsync: (v: unknown) => Promise<unknown> };
  handler: (ctx: unknown, args: never) => Promise<unknown>;
};

const table = new Map<string, ActionDef>();
for (const [name, def] of Object.entries(Actions as Record<string, unknown>)) {
  if (isAction(def)) table.set(name, def as unknown as ActionDef);
}
console.log(`[gola] registered ${table.size} actions`);

const PORT = Number(process.env.PORT ?? 8787);

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, x-request-id",
};

// H3: request-body cap for /actions, enforced BEFORE the body is buffered.
// 110 MiB = 10 images at the 10 MiB per-image cap (see the actions module)
// plus JSON headroom. This constant must move together with that per-image
// cap — a body smaller than the sum of the per-image caps would reject
// legitimate multi-photo posts.
export const MAX_BODY_BYTES = 110 * 1024 * 1024;

/** Read the request body as text, throwing if it exceeds `maxBytes`. */
export async function readCappedBodyText(req: Request, maxBytes: number): Promise<string> {
  const reader = req.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) throw new Error("body-too-large");
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(merged);
}

function baseUrlOf(req: Request): string {
  const proto =
    req.headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "") ??
    "http";
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    `localhost:${PORT}`;
  return `${proto}://${host}`;
}

Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Temporary maintenance gate (approved 2026-10-16; local only).
    // Runs before every route handler below — including /health, which the
    // gate itself exempts. Pure function: zero database writes, so no
    // account, session, recovery-key, or data changes are possible through it.
    const gate = maintenanceGate(req.method, url.pathname, { headers: CORS });
    if (gate) return gate;

    // E: access-mode gate (2026-10-17). Runs AFTER the maintenance gate
    // (maintenance always wins) and BEFORE every route. `closed` rejects
    // everything except GET /health with a distinct message; `allowlist`
    // passes through here and is enforced per-action in the actions layer;
    // `open` (default) preserves today's behavior. Pure: zero database
    // writes, so no account, session, recovery-key, or data changes are
    // possible through it.
    const access = accessGate(req.method, url.pathname, { headers: CORS });
    if (access) return access;

    if (req.method === "GET" && url.pathname === "/health") {
      return Response.json(
        { ok: true, actions: table.size, time: new Date().toISOString() },
        { headers: CORS }
      );
    }

    if (req.method === "GET" && url.pathname.startsWith("/blobs/")) {
      const key = decodeURIComponent(url.pathname.slice("/blobs/".length));
      const blob = await blobStore.read(key);
      if (!blob) {
        return new Response("Not found", { status: 404, headers: CORS });
      }
      return new Response(blob.bytes as unknown as BodyInit, {
        headers: {
          ...CORS,
          "content-type": blob.contentType,
          "cache-control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Discord OAuth relay: Discord redirects here (HTTPS) after the user
    // authorizes; this page immediately bounces the one-time code back into
    // the Gola app via its deep link. Custom schemes don't survive the
    // in-app browser reliably, but an HTTPS landing page can trigger them.
    if (req.method === "GET" && url.pathname === "/oauth/discord") {
      const code = url.searchParams.get("code") ?? "";
      const err = url.searchParams.get("error") ?? "";
      // M1: carry the OAuth `state` through to the app so the client can
      // verify the flow it started (login-CSRF protection). Same escaping
      // treatment as code/error; absent state simply adds nothing.
      const relayState = url.searchParams.get("state") ?? "";
      const stateParam = relayState ? `&state=${encodeURIComponent(relayState)}` : "";
      const deepLink = err
        ? `gola://oauth/discord?error=${encodeURIComponent(err)}${stateParam}`
        : `gola://oauth/discord?code=${encodeURIComponent(code)}${stateParam}`;
      const safeLink = deepLink.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
      const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Returning to Gola…</title>
<style>body{font-family:system-ui,sans-serif;background:#f6f1e7;color:#2b2620;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}.card{background:#fffdf8;border:3px solid #2b2620;border-radius:20px;box-shadow:6px 6px 0 #2b2620;padding:32px;max-width:340px;text-align:center}h1{font-size:20px;margin:0 0 8px}p{font-size:14px;opacity:.75}a{display:inline-block;margin-top:16px;background:#009788;color:#fff;font-weight:700;padding:12px 28px;border-radius:999px;text-decoration:none;border:3px solid #2b2620}</style>
<script>window.location.replace(${JSON.stringify(deepLink)});</script></head>
<body><div class="card"><h1>Returning to Gola…</h1><p>Taking you back to the app.</p><a href="${safeLink}">Open Gola</a></div></body></html>`;
      return new Response(html, {
        headers: { ...CORS, "content-type": "text/html; charset=utf-8" },
      });
    }

    // Android App Links verification — lets gola-backend.onrender.com/p/* URLs
    // open directly in the Gola app when installed.
    if (req.method === "GET" && url.pathname === "/.well-known/assetlinks.json") {
      const assetlinks = [
        {
          relation: ["delegate_permission/common.handle_all_urls"],
          target: {
            namespace: "android_app",
            package_name: "com.gola.app",
            sha256_cert_fingerprints: [
              "00:97:BC:9E:2E:7D:30:86:56:95:B5:09:42:41:70:6C:30:6E:CA:41:44:CE:D7:1A:F5:12:7E:31:E7:E4:DA:DB",
            ],
          },
        },
      ];
      return Response.json(assetlinks, { headers: CORS });
    }

    // Shared profile preview: GET /u/:handle serves a tiny HTML page with Open
    // Graph tags so WhatsApp/Telegram render a clickable preview card.
    if (req.method === "GET" && url.pathname.startsWith("/u/")) {
      const handle = url.pathname.slice("/u/".length).split("/")[0];
      if (!handle || !/^[A-Za-z0-9_]{3,24}$/.test(handle)) {
        return new Response("Not found", { status: 404, headers: CORS });
      }
      try {
        const { db } = await import("./db");
        const { sql } = await import("drizzle-orm");
        const rows = await db.execute(sql`
          SELECT display_name, handle, bio, is_private
          FROM profiles WHERE handle = ${handle.toLowerCase()} LIMIT 1
        `);
        const row = (rows as unknown as any[])[0];
        if (!row) {
          return new Response("Not found", { status: 404, headers: CORS });
        }
        const title = `${row.display_name} (@${row.handle}) on Gola`;
        const desc = row.is_private ? "This profile is private. Open it in the Gola app." : String(row.bio || "Check out this profile on Gola.").slice(0, 200);
        const pageUrl = `https://gola-backend.onrender.com/u/${encodeURIComponent(handle)}`;
        const appLink = `gola://u/${encodeURIComponent(handle)}`;
        const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
        const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="https://gola-backend.onrender.com/icon.png">
<meta property="og:url" content="${esc(pageUrl)}">
<meta property="og:type" content="profile">
<meta name="twitter:card" content="summary">
<style>body{font-family:system-ui,sans-serif;background:#f6f1e7;color:#2b2620;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}.card{background:#fffdf8;border:3px solid #2b2620;border-radius:20px;box-shadow:6px 6px 0 #2b2620;padding:32px;max-width:340px;text-align:center}h1{font-size:20px;margin:0 0 8px}p{font-size:14px;opacity:.75}a{display:inline-block;margin-top:16px;background:#009788;color:#fff;font-weight:700;padding:12px 28px;border-radius:999px;text-decoration:none;border:3px solid #2b2620}</style>
<script>window.location.replace(${JSON.stringify(appLink)});</script></head>
<body><div class="card"><h1>${esc(title)}</h1><p>${esc(desc)}</p><a href="${esc(appLink)}">Open in Gola</a></div></body></html>`;
        return new Response(html, {
          headers: { ...CORS, "content-type": "text/html; charset=utf-8" },
        });
      } catch (e) {
        console.log("[gola][profile-preview] error:", e instanceof Error ? e.message : e);
        return new Response("Not found", { status: 404, headers: CORS });
      }
    }

    // Shared post preview: GET /p/:id serves a tiny HTML page with Open Graph
    // tags so WhatsApp/Telegram render a clickable preview card. The page has
    // an "Open in Gola" button (custom scheme) for users without the app.
    // Private-account posts show a generic placeholder — never the caption.
    if (req.method === "GET" && url.pathname.startsWith("/p/")) {
      const slugOrId = url.pathname.slice("/p/".length).split("/")[0];
      if (!slugOrId || !/^[A-Za-z0-9_-]+$/.test(slugOrId)) {
        return new Response("Not found", { status: 404, headers: CORS });
      }
      try {
        const { db } = await import("./db");
        const { sql } = await import("drizzle-orm");
        // Support both new slugs (hix-20261013-a7f2) and legacy numeric IDs.
        const isNumeric = /^\d+$/.test(slugOrId);
        const rows = await db.execute(sql`
          SELECT p.id, p.text, p.slug, pr.display_name, pr.handle, pr.is_private, pr.is_founder,
                 (SELECT blob_key FROM post_images WHERE post_id = p.id ORDER BY position ASC LIMIT 1) as thumb_key
          FROM posts p
          JOIN profiles pr ON pr.id = p.author_id
          WHERE ${isNumeric ? sql`p.id = ${Number(slugOrId)}` : sql`p.slug = ${slugOrId}`}
          LIMIT 1
        `);
        const row = (rows as unknown as any[])[0];
        if (!row) {
          return new Response("Not found", { status: 404, headers: CORS });
        }
        const isPrivate = !!row.is_private;
        const title = isPrivate ? "A private post on Gola" : `${row.display_name} on Gola`;
        const desc = isPrivate
          ? "This post is private. Open it in the Gola app."
          : String(row.text || "").slice(0, 200);
        const thumb = row.thumb_key
          ? `https://gola-backend.onrender.com/blobs/${encodeURIComponent(row.thumb_key)}`
          : "https://gola-backend.onrender.com/icon.png";
        const pageUrl = `https://gola-backend.onrender.com/p/${slugOrId}`;
        const appLink = `gola://post/${slugOrId}`;
        const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
        const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(thumb)}">
<meta property="og:url" content="${esc(pageUrl)}">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
<style>body{font-family:system-ui,sans-serif;background:#f6f1e7;color:#2b2620;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}.card{background:#fffdf8;border:3px solid #2b2620;border-radius:20px;box-shadow:6px 6px 0 #2b2620;padding:32px;max-width:340px;text-align:center}h1{font-size:20px;margin:0 0 8px}p{font-size:14px;opacity:.75}a{display:inline-block;margin-top:16px;background:#009788;color:#fff;font-weight:700;padding:12px 28px;border-radius:999px;text-decoration:none;border:3px solid #2b2620}</style>
<script>window.location.replace(${JSON.stringify(appLink)});</script></head>
<body><div class="card"><h1>${esc(title)}</h1><p>${esc(desc)}</p><a href="${esc(appLink)}">Open in Gola</a></div></body></html>`;
        return new Response(html, {
          headers: { ...CORS, "content-type": "text/html; charset=utf-8" },
        });
      } catch (e) {
        console.log("[gola][preview] error:", e instanceof Error ? e.message : e);
        return new Response("Not found", { status: 404, headers: CORS });
      }
    }

    if (
      req.method === "POST" &&
      (url.pathname === "/actions" || url.pathname === "/actions/")
    ) {      let body: { action?: unknown; args?: unknown };
      // H3: cheap Content-Length pre-check first, then a bounded streaming
      // read — a missing or lying header cannot bypass the cap, and the
      // server never buffers more than MAX_BODY_BYTES for one request.
      const declaredLength = Number(req.headers.get("content-length"));
      if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
        return Response.json(
          { error: "Request too large." },
          { status: 413, headers: CORS }
        );
      }
      let rawText: string;
      try {
        rawText = await readCappedBodyText(req, MAX_BODY_BYTES);
      } catch {
        return Response.json(
          { error: "Request too large." },
          { status: 413, headers: CORS }
        );
      }
      try {
        body = JSON.parse(rawText);
      } catch {
        return Response.json(
          { error: "Invalid JSON body" },
          { status: 400, headers: CORS }
        );
      }
      // H7: approved-build gate (default OFF). When
      // GOLA_REQUIRE_APPROVED_BUILD=1, the envelope must carry a
      // server-approved appCommit, or the caller must present a live founder
      // session (break-glass). Old clients that send no appCommit are
      // rejected ONLY while enforcement is on. The client sends
      // appCommit from its __GOLA_COMMIT__ stamp (client follow-up); until
      // then this stays off.
      if (versionEnforcementEnabled()) {
        const { db } = await import("./db");
        const verdict = await checkAppBuild(
          db.$client as unknown as Parameters<typeof checkAppBuild>[0],
          (body as { appCommit?: unknown } | null)?.appCommit,
          (body as { args?: { token?: unknown } } | null)?.args?.token
        );
        if (!verdict.ok) {
          return Response.json(
            { error: verdict.message, code: verdict.code },
            { status: 426, headers: CORS }
          );
        }
      }
      const def = table.get(String(body?.action ?? ""));
      if (!def) {
        return Response.json(
          { error: `Unknown action: ${String(body?.action)}` },
          { status: 404, headers: CORS }
        );
      }
      let parsedArgs: unknown;
      try {
        parsedArgs = await def.request.parseAsync(body?.args ?? {});
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return Response.json(
          { error: `Invalid arguments for ${body.action}: ${message}` },
          { status: 400, headers: CORS }
        );
      }
      const ctx = createCtx(baseUrlOf(req));
      try {
        const result = await def.handler(ctx, parsedArgs as never);
        const validated = await def.response.parseAsync(result);
        return Response.json({ data: validated }, { headers: CORS });
      } catch (e) {
        // L1: never leak internals to the client. The full error (with stack)
        // stays in the server log; the client gets a generic message. No
        // client code path depends on the raw 500 text (the app surfaces its
        // own fallback for server errors; only the 404 "Unknown action"
        // signal above is message-inspected, and it is untouched).
        console.error(`[gola][${body.action}]`, e);
        return Response.json(
          { error: "Something went wrong. Please try again." },
          { status: 500, headers: CORS }
        );
      }
    }

    return new Response("Not found", { status: 404, headers: CORS });
  },
});

console.log(`[gola] listening on :${PORT}`);
{
  const mode = accessMode();
  const recognized = isAccessModeRecognized();
  console.log(
    `[gola] access mode: ${mode}${recognized ? "" : ` (unrecognized GOLA_ACCESS_MODE=${JSON.stringify(process.env.GOLA_ACCESS_MODE)} — failing closed)`}, approved-build enforcement: ${versionEnforcementEnabled() ? "ON" : "off"}`
  );
}
console.log(
  `[gola] moderation: ${
    process.env.GEMINI_API_KEY ? "Gemini configured" : "GEMINI_API_KEY MISSING — writes will fail closed"
  }`
);
