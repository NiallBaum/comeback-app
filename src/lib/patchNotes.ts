import type { PatchEntry } from "@/types";

export type PatchBlock = { type: "header" | "bullet" | "text"; text: string };

// Steam's news feed bodies are BBCode, not HTML/Markdown — no renderer for
// that exists yet, so this parses tags into typed blocks (rather than one
// flat string) so headers can get real visual distinction from body text.
// Order matters: known bbcode tags (img/url/list/p) are consumed first, so
// the catch-all at the end only ever sees Valve's own non-standard
// "\[ SECTION HEADER ]" convention, not real tags. List items are
// "[*][p]text[/p][/*]" — the compound pairs are collapsed first, so the
// bullet marker and its text never get split apart by the generic
// [p]/[/p] rule.
export function parsePatchBody(raw: string): PatchBlock[] {
  const tagged = raw
    .replace(/\[img\][^[]*\[\/img\]/gi, "")
    .replace(/\[url="?[^\]]*"?\]/gi, "")
    .replace(/\[\/url\]/gi, "")
    .replace(/\[\*\]\s*\[p\]/gi, "\n@@bullet@@")
    .replace(/\[\/p\]\s*\[\/\*\]/gi, "\n")
    .replace(/\[\*\]/g, "\n@@bullet@@")
    .replace(/\[\/\*\]/g, "")
    .replace(/\[\/?list\]/gi, "")
    .replace(/\[\/?(p|b|i|u|h1|h2|h3)\]/gi, "\n")
    .replace(/\\?\[\s*([^\]]+?)\s*\\?\]/g, "\n@@header@@$1\n");

  return tagged
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): PatchBlock => {
      if (line.startsWith("@@header@@")) return { type: "header", text: line.slice(10) };
      if (line.startsWith("@@bullet@@")) return { type: "bullet", text: line.slice(10) };
      return { type: "text", text: line };
    });
}

// Condensed "what changed" summary for a panel that also shows a build
// recommendation — pulls bullet-level changes only (skips headers/prose)
// across the most recent entries until maxBullets is filled, since one
// patch entry alone doesn't always have enough bullets to say something
// substantive.
export function getPatchHighlights(entries: PatchEntry[], maxBullets = 3): string[] {
  const highlights: string[] = [];

  for (const entry of entries) {
    if (highlights.length >= maxBullets) break;
    for (const block of parsePatchBody(entry.rawBody)) {
      if (block.type !== "bullet") continue;
      highlights.push(block.text);
      if (highlights.length >= maxBullets) break;
    }
  }

  return highlights;
}
