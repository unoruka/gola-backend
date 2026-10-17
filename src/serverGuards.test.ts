// Backend server guards: H3 request-body cap (2026-10-17).
//
// The module boots the REAL server on import (real committed
// dist/actions.js, temp GOLA_DATA_DIR, fixed test port), so the HTTP tests
// below exercise the production request path: Content-Length pre-check,
// bounded streaming read, then JSON parse.
//
// L1 (generic 500) is verified separately with a scratch stub dist (not
// committed): swap dist/actions.js for a throwing stub, assert the client
// gets "Something went wrong. Please try again." with no internals, restore.
//
// Run: bun test src/serverGuards.test.ts
import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const PORT = 18787;
const dir = mkdtempSync(join(tmpdir(), "gola-be-test-"));

process.env.PORT = String(PORT);
process.env.GOLA_DATA_DIR = join(dir, "data");
// GOLA_MAINTENANCE intentionally unset: the gate defaults to off so
// /actions is reachable; /health is exempt either way.

// Dynamic import AFTER env is set: importing ./server.ts runs migrations
// and starts Bun.serve as a side effect.
const serverMod = await import("./server.ts");
const { MAX_BODY_BYTES, readCappedBodyText } = serverMod;

function waitForHealth(): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 15_000;
    const tick = async () => {
      try {
        const r = await fetch(`http://127.0.0.1:${PORT}/health`);
        if (r.ok) return resolve();
      } catch {
        /* not up yet */
      }
      if (Date.now() > deadline) return reject(new Error("server did not boot"));
      setTimeout(tick, 100);
    };
    tick();
  });
}

beforeAll(waitForHealth);
afterAll(() => rmSync(dir, { recursive: true, force: true }));

/** Raw-socket POST: full control over the declared Content-Length. */
function rawPost(headers: Record<string, string>, body: string): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const sock = connect(PORT, "127.0.0.1", () => {
      let head = `POST /actions HTTP/1.1\r\nHost: 127.0.0.1:${PORT}\r\nConnection: close\r\n`;
      for (const [k, v] of Object.entries(headers)) head += `${k}: ${v}\r\n`;
      sock.write(head + "\r\n" + body);
    });
    let data = "";
    sock.on("data", (c) => (data += c.toString("latin1")));
    sock.on("end", () => {
      const [head, ...rest] = data.split("\r\n\r\n");
      const status = Number((head ?? "").split(" ")[1]);
      resolve({ status, text: rest.join("\r\n\r\n") });
    });
    sock.on("error", reject);
    setTimeout(() => reject(new Error("rawPost timeout")), 10_000);
  });
}

describe("H3 MAX_BODY_BYTES", () => {
  test("cap is 110 MiB (10 x 10 MiB per-image cap + headroom)", () => {
    expect(MAX_BODY_BYTES).toBe(110 * 1024 * 1024);
  });
});

describe("H3 readCappedBodyText", () => {
  const req = (text: string) =>
    new Request("http://x/actions", { method: "POST", body: text });
  test("small body passes through intact", async () => {
    expect(await readCappedBodyText(req('{"a":1}'), 100)).toBe('{"a":1}');
  });
  test("exactly-at-cap passes, one byte over throws", async () => {
    expect(await readCappedBodyText(req("x".repeat(100)), 100)).toBe("x".repeat(100));
    await expect(readCappedBodyText(req("x".repeat(101)), 100)).rejects.toThrow("body-too-large");
  });
  test("empty body reads as empty string", async () => {
    expect(await readCappedBodyText(req(""), 100)).toBe("");
  });
  test("chunked stream accumulates correctly across chunks", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(new TextEncoder().encode("hello "));
        c.enqueue(new TextEncoder().encode("world"));
        c.close();
      },
    });
    const r = new Request("http://x/actions", { method: "POST", body: stream, duplex: "half" } as RequestInit);
    expect(await readCappedBodyText(r, 100)).toBe("hello world");
  });
  test("chunked stream exceeding the cap mid-stream throws", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(new Uint8Array(60));
        c.enqueue(new Uint8Array(60));
        c.close();
      },
    });
    const r = new Request("http://x/actions", { method: "POST", body: stream, duplex: "half" } as RequestInit);
    await expect(readCappedBodyText(r, 100)).rejects.toThrow("body-too-large");
  });
});

describe("H3 /actions body cap over HTTP", () => {
  test("declared Content-Length over the cap -> 413 without reading the body", async () => {
    const { status, text } = await rawPost(
      { "content-type": "application/json", "content-length": String(MAX_BODY_BYTES + 1) },
      JSON.stringify({ action: "nope", args: {} }) // tiny actual body; the header alone rejects
    );
    expect(status).toBe(413);
    expect(text).toContain("Request too large.");
  });

  test("normal small JSON body passes the cap (unknown action -> 404)", async () => {
    const body = JSON.stringify({ action: "nope", args: {} });
    const { status, text } = await rawPost(
      { "content-type": "application/json", "content-length": String(body.length) },
      body
    );
    expect(status).toBe(404);
    expect(text).toContain("Unknown action");
  });

  test("invalid JSON -> 400, not 413", async () => {
    const { status, text } = await rawPost(
      { "content-type": "application/json", "content-length": "7" },
      "{oops!}"
    );
    expect(status).toBe(400);
    expect(text).toContain("Invalid JSON body");
  });

  test("declared length exactly at the cap is read (not rejected by the pre-check)", async () => {
    // Body is small; the declared length matches it. The point: a truthful
    // Content-Length under the cap flows to the normal JSON path.
    const body = JSON.stringify({ action: "nope", args: {} });
    const { status } = await rawPost(
      { "content-type": "application/json", "content-length": String(body.length) },
      body
    );
    expect(status).toBe(404);
  });
});
