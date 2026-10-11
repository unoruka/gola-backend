// Kindness-moderation backend (replaces the Muse artifact runtime inference).
// Routes ctx.inference.complete() to the Google AI Studio Gemini free tier.
//
// FAIL-CLOSED: if GEMINI_API_KEY is not set, this throws a clear error and the
// calling write action (post/comment/story) fails instead of publishing
// unmoderated content. Moderation is NEVER silently skipped.
import { z } from "zod";

export interface CompleteOptions<T extends z.ZodType> {
  schema: T;
  system?: string;
  timeout_secs?: number;
}

export async function complete<T extends z.ZodType>(
  prompt: string,
  options: CompleteOptions<T>
): Promise<z.infer<T>> {
  // Test-only seam: GOLA_TEST_MODERATION=allow|block bypasses the live model
  // for local integration testing. NEVER set this in production — it disables
  // real kindness moderation.
  const stub = process.env.GOLA_TEST_MODERATION;
  if (stub === "allow" || stub === "block") {
    const verdict =
      stub === "allow"
        ? { allowed: true, feedback: "" }
        : { allowed: false, feedback: "Test moderation blocked this text." };
    return options.schema.parse(verdict);
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Content moderation is not configured on this server (GEMINI_API_KEY is missing). " +
        "Writing is disabled until a free Gemini API key is set — see DEPLOY.md for how to get one. " +
        "This is intentional: Gola never publishes unmoderated content."
    );
  }
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  // Convert the zod contract to JSON Schema for Gemini structured output.
  const jsonSchema = z.toJSONSchema(options.schema) as Record<string, unknown>;
  delete jsonSchema.$schema; // Gemini rejects the $schema keyword.

  const timeoutMs = (options.timeout_secs ?? 30) * 1000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...(options.system
            ? { system_instruction: { parts: [{ text: options.system }] } }
            : {}),
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: jsonSchema,
            temperature: 0,
          },
        }),
        signal: ctrl.signal,
      }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Content moderation failed (Gemini HTTP ${res.status}). Please try again. ${text.slice(0, 200)}`
      );
    }
    const body = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text =
      body.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("") ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(
        "Content moderation returned an unreadable response. Please try again."
      );
    }
    return options.schema.parse(parsed);
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Content moderation timed out. Please try again.");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
