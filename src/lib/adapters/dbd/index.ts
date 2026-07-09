import type { GameAdapter } from "../types";

// Build last — no structured meta data exists for DBD, only opinion-based
// tier lists. Recommendations must be labeled "community-consensus", not
// presented with PoE's "data-backed" confidence (spec section 4.4/6b).
export const dbdAdapter: GameAdapter = {
  gameId: "dbd",
  async fetchPatchNotes(sinceDate) {
    throw new Error("not implemented");
  },
  async fetchRecommendedBuilds() {
    throw new Error("not implemented");
  },
};
