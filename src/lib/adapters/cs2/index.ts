import type { GameAdapter } from "../types";
import type { BuildRecommendation } from "@/types";
import { fetchGenericPatchNotes } from "../genericSteamNews";

// CS2 has no item/loadout meta concept the way PoE/Dota do (cosmetic skins
// only, no power-affecting build choices) — see tech-spec.md Section 4.4.
// fetchRecommendedBuilds intentionally returns an empty array rather than
// synthesizing an opinion-based "build" section.
export const cs2Adapter: GameAdapter = {
  gameId: "cs2",
  async fetchPatchNotes(sinceDate) {
    return fetchGenericPatchNotes(730, sinceDate, "cs2");
  },
  async fetchRecommendedBuilds(): Promise<BuildRecommendation[]> {
    return [];
  },
};
