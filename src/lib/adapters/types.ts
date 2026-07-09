import type { BuildRecommendation, GameId, PatchEntry } from "@/types";

// Contract every per-game adapter implements (spec section 4.2 / 4.4).
// Data quality varies by game — PoE has real ladder data, DBD does not.
// Adapters must be honest about that via BuildRecommendation.confidence.
export interface GameAdapter {
  gameId: GameId;
  fetchPatchNotes(sinceDate: string): Promise<PatchEntry[]>;
  fetchRecommendedBuilds(): Promise<BuildRecommendation[]>;
}
