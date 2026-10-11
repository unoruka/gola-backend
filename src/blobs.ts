// Filesystem blob store (replaces the Muse artifact runtime blob storage).
// Files live under <data>/blobs/<key>; served over HTTP at /blobs/<key>.
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, normalize, dirname } from "node:path";
import { DATA_DIR } from "./db";

const BLOBS_DIR = join(DATA_DIR, "blobs");

function safeKey(key: string): string {
  const n = normalize(key).replace(/^(\.\.([/\\]|$))+/, "");
  if (n.includes("..") || n.startsWith("/") || n.startsWith("\\") || n === "") {
    throw new Error(`Invalid blob key: ${key}`);
  }
  return n;
}

function toBytes(data: string | ArrayBuffer | ArrayBufferView | Blob): Uint8Array {
  if (typeof data === "string") return new TextEncoder().encode(data);
  if (data instanceof Uint8Array) return data;
  if (ArrayBuffer.isView(data))
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  throw new Error("Unsupported blob data type");
}

export interface BlobMeta {
  contentType: string;
  size: number;
}

export const blobStore = {
  async put(
    key: string,
    data: string | ArrayBuffer | ArrayBufferView | Blob,
    options?: { contentType?: string }
  ): Promise<void> {
    const rel = safeKey(key);
    const path = join(BLOBS_DIR, rel);
    await mkdir(dirname(path), { recursive: true });
    const bytes =
      data instanceof Blob ? new Uint8Array(await data.arrayBuffer()) : toBytes(data);
    await writeFile(path, bytes);
    const meta: BlobMeta = {
      contentType: options?.contentType ?? "application/octet-stream",
      size: bytes.length,
    };
    await writeFile(path + ".meta.json", JSON.stringify(meta));
  },

  /** Absolute filesystem path, or null when the blob does not exist. */
  pathFor(key: string): string | null {
    try {
      const p = join(BLOBS_DIR, safeKey(key));
      return existsSync(p) ? p : null;
    } catch {
      return null;
    }
  },

  metaFor(key: string): BlobMeta | null {
    try {
      return JSON.parse(
        readFileSync(join(BLOBS_DIR, safeKey(key)) + ".meta.json", "utf8")
      ) as BlobMeta;
    } catch {
      return null;
    }
  },

  async delete(key: string): Promise<void> {
    const rel = safeKey(key);
    const p = join(BLOBS_DIR, rel);
    await rm(p, { force: true });
    await rm(p + ".meta.json", { force: true });
  },

  async list(prefix = ""): Promise<string[]> {
    const out: string[] = [];
    const walk = (dir: string, rel: string) => {
      let entries: string[] = [];
      try {
        entries = readdirSync(dir);
      } catch {
        return;
      }
      for (const e of entries) {
        if (e.endsWith(".meta.json")) continue;
        const full = join(dir, e);
        const r = rel ? `${rel}/${e}` : e;
        try {
          if (statSync(full).isDirectory()) walk(full, r);
          else if (!prefix || r.startsWith(prefix)) out.push(r);
        } catch {
          /* ignore */
        }
      }
    };
    walk(BLOBS_DIR, "");
    return out;
  },
};
