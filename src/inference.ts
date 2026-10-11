// Kindness-moderation backend (replaces the Muse artifact runtime inference).
// Routes ctx.inference.complete() to the Google AI Studio Gemini free tier,
// with a local fallback filter if Gemini is unreachable or too slow.
//
// If GEMINI_API_KEY is not set, this throws and writing is disabled.
// If Gemini fails at request time, a conservative local filter applies instead
// of blocking the user: obvious severe abuse is still caught, everything else
// is allowed through until Gemini recovers.
import { z } from "zod";

export interface CompleteOptions<T extends z.ZodType> {
  schema: T;
  system?: string;
  timeout_secs?: number;
}

// ---------------------------------------------------------------------------
// Local fallback kindness filter.
//
// If Gemini is unreachable or too slow, posts must not be blocked by a broken
// AI service. This fallback applies a conservative local check: it blocks only
// obvious severe abuse (slurs, direct threats, targeted harassment patterns)
// and allows everything else through. It is intentionally narrow — Gemini
// remains the primary moderator whenever it answers.
// ---------------------------------------------------------------------------

/** Extract the user's text from a moderation prompt ("... Text: \"...\""). */
function extractUserText(prompt: string): string {
  const m = prompt.match(/Text:\s*("(?:[^"\\]|\\.)*")\s*$/s);
  if (m?.[1]) {
    try {
      return JSON.parse(m[1]) as string;
    } catch {
      return m[1];
    }
  }
  return prompt;
}

// Severe slurs and direct-threat patterns. Kept intentionally short to avoid
// false positives; Gemini handles nuance when it is available.
const BLOCK_PATTERNS: RegExp[] = [
  /\bkys\b/i,
  /\bkill\s+(yourself|urself|u)\b/i,
  /\bi\s+will\s+kill\s+you\b/i,
  /\bdeath\s+threat\b/i,
  // Racial / protected-group slurs (a minimal, high-confidence set)
  /\bn[i1!]gg[ae3]r/i,
  /\bf[a@]gg[o0]t/i,
  /\bch[i1!]nk\b/i,
  /\bsp[i1!]c\b/i,
  /\bk[i1!]ke\b/i,
  /\btowel\s*head/i,
  /\btr[a@]nn[y|ie]\b/i,
  /\br[e3]tard\b/i,
];

function localModerate<T extends z.ZodType>(
  prompt: string,
  schema: T
): z.infer<T> {
  const text = extractUserText(prompt);
  const blocked = BLOCK_PATTERNS.some((re) => re.test(text));
  const verdict = blocked
    ? {
        allowed: false,
        feedback:
          "Please rewrite this around your own experience or a positive request.",
      }
    : { allowed: true, feedback: "" };
  console.warn(
    `[gola][moderation] Gemini unavailable — local fallback filter ${blocked ? "BLOCKED" : "allowed"} a post`
  );
  return schema.parse(verdict);
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
      console.warn("[gola][moderation] Gemini timed out — using local fallback filter");
      return localModerate(prompt, options.schema);
    }
    // Any other Gemini failure (HTTP error, bad response): fall back locally
    // instead of blocking the user. The local filter still catches severe abuse.
    console.warn(
      `[gola][moderation] Gemini failed (${e instanceof Error ? e.message.slice(0, 120) : e}) — using local fallback filter`
    );
    return localModerate(prompt, options.schema);
  } finally {
    clearTimeout(timer);
  }
}
