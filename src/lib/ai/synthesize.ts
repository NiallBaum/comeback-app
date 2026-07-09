import type { BuildRecommendation, GameId, PatchEntry } from "@/types";

// Claude API synthesis step — "what changed" + "what's popular" (spec 6).
// Uses per-game prompt templates since generic "summarize this" prompting
// produces mediocre output (spec section 5, point 4).

export async function synthesizeChangedSinceYouLeft(
  gameId: GameId,
  patchEntries: PatchEntry[],
  lastPlayedDate: string,
): Promise<string> {
  throw new Error("not implemented");
}

export async function synthesizeRecommendations(
  gameId: GameId,
  builds: BuildRecommendation[],
): Promise<BuildRecommendation[]> {
  throw new Error("not implemented");
}
