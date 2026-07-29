import type { BuildRecommendation, GameId, PatchEntry } from "@/types";

// Contract every per-game adapter implements (spec section 4.2 / 4.4).
// Data quality/coverage varies by game — PoE/Dota 2 have real build data,
// CS2 has none and returns an empty array from fetchRecommendedBuilds.
// Adapters must be honest about that via BuildRecommendation.confidence.
export interface GameAdapter {
  gameId: GameId;
  fetchPatchNotes(sinceDate: string): Promise<PatchEntry[]>;
  // heroName selects a single character/class to build a recommendation for
  // (a player's "main" or a manually picked one) instead of the default
  // top-N-by-meta list. Optional — existing callers/adapters are unaffected.
  fetchRecommendedBuilds(heroName?: string): Promise<BuildRecommendation[]>;
}
