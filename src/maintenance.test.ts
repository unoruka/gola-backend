// Tests for the temporary maintenance gate (approved 2026-10-16; local only).
// The gate module is side-effect free: these tests import only
// ./maintenance, never server.ts (which binds a port and a database).
import { describe, expect, test } from "bun:test";
import {
  MAINTENANCE_MESSAGE_DEFAULT,
  isMaintenanceMode,
  maintenanceGate,
  maintenanceMessage,
} from "./maintenance";

const ON = { GOLA_MAINTENANCE: "1" } as NodeJS.ProcessEnv;
const OFF = {} as NodeJS.ProcessEnv;

async function errorOf(res: Response): Promise<unknown> {
  expect(res.status).toBe(503);
  const body = (await res.json()) as { error?: unknown };
  return body.error;
}

describe("maintenance off", () => {
  const routes: Array<[string, string]> = [
    ["POST", "/actions"],
    ["GET", "/health"],
    ["GET", "/oauth/discord"],
    ["GET", "/blobs/some-key"],
    ["GET", "/u/somehandle"],
    ["GET", "/p/123"],
    ["GET", "/.well-known/assetlinks.json"],
  ];
  for (const [method, path] of routes) {
    test(`${method} ${path} passes through`, () => {
      expect(maintenanceGate(method, path, { env: OFF })).toBeNull();
    });
  }
  test("only exact \"1\" enables maintenance", () => {
    for (const v of ["0", "true", "yes", ""]) {
      const env = { GOLA_MAINTENANCE: v } as NodeJS.ProcessEnv;
      expect(isMaintenanceMode(env)).toBe(false);
      expect(maintenanceGate("POST", "/actions", { env })).toBeNull();
    }
    expect(isMaintenanceMode(ON)).toBe(true);
  });
});

describe("maintenance on", () => {
  const blocked: Array<[string, string]> = [
    ["POST", "/actions"],
    ["GET", "/oauth/discord"],
    ["GET", "/blobs/some-key"],
    ["GET", "/u/somehandle"],
    ["GET", "/p/123"],
    ["GET", "/.well-known/assetlinks.json"],
    ["POST", "/health"],
  ];
  for (const [method, path] of blocked) {
    test(`${method} ${path} -> 503 with the exact message`, async () => {
      const res = maintenanceGate(method, path, { env: ON });
      expect(res).not.toBeNull();
      expect(await errorOf(res!)).toBe(MAINTENANCE_MESSAGE_DEFAULT);
    });
  }

  test("GET /health stays available", () => {
    expect(maintenanceGate("GET", "/health", { env: ON })).toBeNull();
  });

  test("custom message via GOLA_MAINTENANCE_MESSAGE", async () => {
    const env = {
      GOLA_MAINTENANCE: "1",
      GOLA_MAINTENANCE_MESSAGE: "Custom message.",
    } as NodeJS.ProcessEnv;
    expect(maintenanceMessage(env)).toBe("Custom message.");
    const res = maintenanceGate("POST", "/actions", { env });
    expect(await errorOf(res!)).toBe("Custom message.");
  });

  test("default message constant is the approved copy", () => {
    expect(MAINTENANCE_MESSAGE_DEFAULT).toBe(
      "Gola is being updated. A new version is coming soon."
    );
  });

  test("CORS headers are forwarded when provided", async () => {
    const res = maintenanceGate("POST", "/actions", {
      env: ON,
      headers: { "access-control-allow-origin": "*" },
    });
    expect(res!.headers.get("access-control-allow-origin")).toBe("*");
  });
});
