import type { PatchEntry } from "@/types";

export function filterPatchNotesByHero(patchNotes: PatchEntry[], heroName: string): PatchEntry[] {
  const needle = heroName.toLowerCase();

  return patchNotes.filter((entry) => {
    return entry.rawTitle.toLowerCase().includes(needle) || entry.rawBody.toLowerCase().includes(needle)
  })
}