// M2 tests: GOLA_TEST_MODERATION must fail closed outside an explicit test
// context. Each case spawns a fresh `bun` subprocess so module-level import
// behavior (and env) is isolated per case — never rely on the parent runner's
// environment.
import { describe, expect, test } from "bun:test";
import { join } from "node:path";

const REPO = join(import.meta.dir, "..");

interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

function runChild(env: Record<string, string>, script: string): RunResult {
  const proc = Bun.spawnSync(["bun", "-e", script], {
    cwd: REPO,
    env: { ...process.env, ...env },
  });
  return {
    exitCode: proc.exitCode ?? -1,
    stdout: proc.stdout.toString(),
    stderr: proc.stderr.toString(),
  };
}

const IMPORT_ONLY = `await import("./src/inference.ts");`;

const STUB_RUN = `
  const { complete } = await import("./src/inference.ts");
  const { z } = await import("zod");
  const schema = z.object({ allowed: z.boolean(), feedback: z.string() });
  const verdict = await complete("Text: \\"hello there\\"", { schema });
  console.log(JSON.stringify(verdict));
`;

describe("M2 GOLA_TEST_MODERATION safeguard", () => {
  test("refuses to start when the seam is set without GOLA_ENV=test (allow)", () => {
    const r = runChild(
      { GOLA_TEST_MODERATION: "allow", GOLA_ENV: "" },
      IMPORT_ONLY
    );
    // GOLA_ENV="" must NOT count as a test context.
    expect(r.exitCode).not.toBe(0);
    expect(r.stderr).toContain("Refusing to start with kindness moderation disabled");
  });

  test("refuses to start when the seam is set without GOLA_ENV=test (block)", () => {
    const env: Record<string, string> = { GOLA_TEST_MODERATION: "block" };
    delete env["GOLA_ENV"];
    const merged = { ...process.env };
    delete merged["GOLA_ENV"];
    const proc = Bun.spawnSync(["bun", "-e", IMPORT_ONLY], {
      cwd: REPO,
      env: { ...merged, ...env },
    });
    expect(proc.exitCode ?? -1).not.toBe(0);
    expect(proc.stderr.toString()).toContain(
      "Refusing to start with kindness moderation disabled"
    );
  });

  test("GOLA_ENV=test + allow: stub works, no network call", () => {
    const r = runChild(
      { GOLA_TEST_MODERATION: "allow", GOLA_ENV: "test" },
      STUB_RUN
    );
    expect(r.exitCode).toBe(0);
    expect(JSON.parse(r.stdout)).toEqual({ allowed: true, feedback: "" });
  });

  test("GOLA_ENV=test + block: stub blocks", () => {
    const r = runChild(
      { GOLA_TEST_MODERATION: "block", GOLA_ENV: "test" },
      STUB_RUN
    );
    expect(r.exitCode).toBe(0);
    const verdict = JSON.parse(r.stdout) as { allowed: boolean };
    expect(verdict.allowed).toBe(false);
  });

  test("seam unset: module imports cleanly", () => {
    const merged = { ...process.env };
    delete merged["GOLA_TEST_MODERATION"];
    delete merged["GOLA_ENV"];
    const proc = Bun.spawnSync(["bun", "-e", IMPORT_ONLY], {
      cwd: REPO,
      env: merged,
    });
    expect(proc.exitCode).toBe(0);
  });
});
