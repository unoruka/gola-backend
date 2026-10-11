// Per-request Ctx shim: faithful stand-in for the Muse artifact runtime Ctx,
// backed by SQLite (db), the filesystem (blobs), Gemini (inference), and the
// pluggable privileged shim (Google Sheets/Drive).
import { join } from "node:path";
import { db } from "./db";
import { blobStore } from "./blobs";
import { complete } from "./inference";
import { executePrivilegedShim } from "./privileged";

export interface CtxShim {
  slug: string;
  invocationId: string;
  spaceDir: string;
  db: () => typeof db;
  viewer?: undefined;
  blobs: {
    put(
      key: string,
      data: string | ArrayBuffer | ArrayBufferView | Blob,
      options?: { contentType?: string; public?: boolean }
    ): Promise<void>;
    getUrl(key: string, options?: { expiresInSeconds?: number }): Promise<string>;
    delete(key: string): Promise<void>;
    head(key: string): Promise<null | {
      key: string;
      contentType: string;
      size: number;
      sizeBytes: number;
      etag: string;
      visibility: "private" | "public";
      createdAtMs: number;
      updatedAtMs: number;
      public: boolean;
    }>;
    list(prefix?: string): Promise<unknown[]>;
  };
  inference: { complete: typeof complete };
  executePrivileged: (contract: { name: string }, args: unknown) => Promise<unknown>;
  emit: (data: unknown) => void;
  invalidateQueries: (invalidation?: unknown) => void;
}

/** Build a Ctx for one HTTP request. baseUrl is used for absolute blob URLs. */
export function createCtx(baseUrl: string): CtxShim {
  const cleanBase = baseUrl.replace(/\/$/, "");
  return {
    slug: "simple-social-app",
    invocationId: crypto.randomUUID(),
    spaceDir: join(import.meta.dir, ".."),
    db: () => db,
    viewer: undefined,
    blobs: {
      put: (key, data, options) => blobStore.put(key, data, options),
      getUrl: async (key) =>
        `${cleanBase}/blobs/${key
          .split("/")
          .map((s) => encodeURIComponent(s))
          .join("/")}`,
      delete: (key) => blobStore.delete(key),
      head: async (key) => {
        const meta = blobStore.metaFor(key);
        if (!meta) return null;
        return {
          key,
          contentType: meta.contentType,
          size: meta.size,
          sizeBytes: meta.size,
          etag: "",
          visibility: "public" as const,
          createdAtMs: 0,
          updatedAtMs: 0,
          public: true,
        };
      },
      list: async (prefix) => blobStore.list(prefix),
    },
    inference: { complete },
    executePrivileged: (contract, args) =>
      executePrivilegedShim(contract.name, args),
    emit: () => {},
    invalidateQueries: () => {},
  };
}
