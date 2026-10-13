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
      const deepLink = err
        ? `gola://oauth/discord?error=${encodeURIComponent(err)}`
        : `gola://oauth/discord?code=${encodeURIComponent(code)}`;
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

    // Shared post preview: GET /p/:id serves a tiny HTML page with Open Graph
    // tags so WhatsApp/Telegram render a clickable preview card. The page has
    // an "Open in Gola" button (custom scheme) for users without the app.
    // Private-account posts show a generic placeholder — never the caption.
    if (req.method === "GET" && url.pathname.startsWith("/p/")) {
      const postId = url.pathname.slice("/p/".length).split("/")[0];
      if (!/^\d+$/.test(postId)) {
        return new Response("Not found", { status: 404, headers: CORS });
      }
      try {
        const { db } = await import("./db");
        const { sql } = await import("drizzle-orm");
        const rows = await db.execute(sql`
          SELECT p.id, p.text, pr.display_name, pr.handle, pr.is_private, pr.is_founder,
                 (SELECT blob_key FROM post_images WHERE post_id = p.id ORDER BY position ASC LIMIT 1) as thumb_key
          FROM posts p
          JOIN profiles pr ON pr.id = p.author_id
          WHERE p.id = ${Number(postId)}
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
        const pageUrl = `https://gola-backend.onrender.com/p/${postId}`;
        const appLink = `gola://post/${postId}`;
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
      try {
        body = await req.json();
      } catch {
        return Response.json(
          { error: "Invalid JSON body" },
          { status: 400, headers: CORS }
        );
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
        const message = e instanceof Error ? e.message : String(e);
        console.error(`[gola][${body.action}] ${message}`);
        return Response.json({ error: message }, { status: 500, headers: CORS });
      }
    }

    return new Response("Not found", { status: 404, headers: CORS });
  },
});

console.log(`[gola] listening on :${PORT}`);
console.log(
  `[gola] moderation: ${
    process.env.GEMINI_API_KEY ? "Gemini configured" : "GEMINI_API_KEY MISSING — writes will fail closed"
  }`
);
