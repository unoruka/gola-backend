// Durable blob store (replaces the filesystem blob storage).
//
// Render's free-tier filesystem is ephemeral: every deploy/restart wiped
// <data>/blobs, deleting all uploaded avatars and post photos. Blobs now
// live in the `blobs` table (migration 0022) in Turso, which is permanent.
// Served over HTTP at /blobs/<key> exactly as before, so no client change
// is needed. Local SQLite fallback keeps working with the same code.
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { eq, like } from "drizzle-orm";
import { db } from "./db";

const blobs = sqliteTable("blobs", {
  key: text("key").primaryKey(),
  data: blob("data", { mode: "buffer" }).notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  createdAt: integer("created_at").notNull(),
});

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

export interface BlobRead {
  bytes: Uint8Array;
  contentType: string;
}

export const blobStore = {
  async put(
    key: string,
    data: string | ArrayBuffer | ArrayBufferView | Blob,
    options?: { contentType?: string }
  ): Promise<void> {
    if (!key || key.includes("..") || key.startsWith("/")) {
      throw new Error(`Invalid blob key: ${key}`);
    }
    const bytes =
      data instanceof Blob ? new Uint8Array(await data.arrayBuffer()) : toBytes(data);
    const row = {
      key,
      data: Buffer.from(bytes),
      contentType: options?.contentType ?? "application/octet-stream",
      size: bytes.length,
      createdAt: Date.now(),
    };
    await db
      .insert(blobs)
      .values(row)
      .onConflictDoUpdate({
        target: blobs.key,
        set: {
          data: row.data,
          contentType: row.contentType,
          size: row.size,
          createdAt: row.createdAt,
        },
      });
  },

  /** Raw bytes + content type, or null when the blob does not exist. */
  async read(key: string): Promise<BlobRead | null> {
    try {
      const rows = await db
        .select({ data: blobs.data, contentType: blobs.contentType })
        .from(blobs)
        .where(eq(blobs.key, key))
        .limit(1);
      const row = rows[0];
      if (!row) return null;
      return { bytes: new Uint8Array(row.data), contentType: row.contentType };
    } catch {
      return null;
    }
  },

  async meta(key: string): Promise<BlobMeta | null> {
    try {
      const rows = await db
        .select({ contentType: blobs.contentType, size: blobs.size })
        .from(blobs)
        .where(eq(blobs.key, key))
        .limit(1);
      const row = rows[0];
      return row ? { contentType: row.contentType, size: row.size } : null;
    } catch {
      return null;
    }
  },

  async delete(key: string): Promise<void> {
    try {
      await db.delete(blobs).where(eq(blobs.key, key));
    } catch {
      /* ignore */
    }
  },

  async list(prefix = ""): Promise<string[]> {
    try {
      const base = db.select({ key: blobs.key }).from(blobs);
      const rows = await (prefix
        ? base.where(like(blobs.key, `${prefix}%`))
        : base);
      return rows.map((r) => r.key);
    } catch {
      return [];
    }
  },
};
