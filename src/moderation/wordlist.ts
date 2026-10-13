// Word-list pre-filter for moderation.
// Source: LDNOOBW (List of Dirty, Naughty, Obscene, and Otherwise Bad Words)
// https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words
// License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)

import { WORD_LISTS } from "./wordlists.js";

const wordSets = new Map<string, Set<string>>();

function getSet(lang: string): Set<string> {
  let set = wordSets.get(lang);
  if (!set) {
    set = new Set((WORD_LISTS[lang] || []).map((w) => w.toLowerCase()));
    wordSets.set(lang, set);
  }
  return set;
}

// Check text against banned word lists. Returns the matched word or null.
// Uses word-boundary matching to avoid false positives (e.g. "class" containing "ass").
export function findBannedWord(text: string, lang: string = "en"): string | null {
  const words = getSet(lang);
  if (words.size === 0) return null;

  const lower = text.toLowerCase();
  // Split into words on non-alphanumeric boundaries (unicode-aware)
  const tokens = lower.split(/[^\p{L}\p{N}]+/u).filter(Boolean);

  for (const token of tokens) {
    if (words.has(token)) return token;
  }
  return null;
}

// Check against all loaded languages (for mixed-language content)
export function findBannedWordAny(text: string): { word: string; lang: string } | null {
  for (const lang of ["en", "hi", "es", "fr", "ar"]) {
    const word = findBannedWord(text, lang);
    if (word) return { word, lang };
  }
  return null;
}

// Spam pattern detection (Discord AutoMod-style)
export function detectSpam(text: string): string | null {
  // Excessive caps (>70% caps in 10+ char text)
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length >= 10) {
    const caps = letters.replace(/[^A-Z]/g, "").length;
    if (caps / letters.length > 0.7) return "excessive_caps";
  }

  // Excessive repeated characters (e.g. "heyyyyyyy")
  if (/(.)\1{5,}/.test(text)) return "repeated_chars";

  // Excessive emoji (>10 emoji)
  const emojiCount = (text.match(/\p{Extended_Pictographic}/gu) || []).length;
  if (emojiCount > 10) return "excessive_emoji";

  // Link spam (multiple URLs)
  const urls = (text.match(/https?:\/\/\S+/g) || []).length;
  if (urls > 2) return "link_spam";

  return null;
}
