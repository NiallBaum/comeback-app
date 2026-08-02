import { parsePatchBody } from "@/lib/patchNotes";
import type { PatchEntry } from "@/types";

export function filterPatchNotesByHero(patchNotes: PatchEntry[], heroName: string): PatchEntry[] {
  const needle = heroName.toLowerCase();

  return patchNotes.filter((entry) => {
    return entry.rawTitle.toLowerCase().includes(needle) || entry.rawBody.toLowerCase().includes(needle)
  })
}

// filterPatchNotesByHero tells you a patch mentions a hero, but a patch
// title ("7.41a Gameplay Patch") says nothing on its own - this pulls the
// actual bullet lines that mention the hero, which is the part that's
// actually readable/useful on its own.
export function getHeroPatchHighlights(patchNotes: PatchEntry[], heroName: string, maxBullets = 3): string[] {
  const needle = heroName.toLowerCase();
  const highlights: string[] = [];

  for (const entry of patchNotes) {
    if (highlights.length >= maxBullets) break;
    for (const block of parsePatchBody(entry.rawBody)) {
      if (block.type !== "bullet") continue;
      if (!block.text.toLowerCase().includes(needle)) continue;
      highlights.push(block.text);
      if (highlights.length >= maxBullets) break;
    }
  }

  return highlights;
}