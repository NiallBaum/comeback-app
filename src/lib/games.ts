import type { GameId } from "@/types";

export interface GameConfig {
  id: GameId;
  name: string;
  steamAppId: number;
}

// The curated "deep dive" games — real personalized builds/stats on top of
// patch notes, via a bespoke GameAdapter each. Every other owned game still
// gets a free, generic patch-notes-only panel (see getGenericPatchNotesWithCache
// in src/lib/cache/patchNotes.ts) — this list is no longer the full set of
// games the dashboard supports, just the ones with extra personalization.
export const SUPPORTED_GAMES: GameConfig[] = [
  { id: "dota2", name: "Dota 2", steamAppId: 570 },
];
