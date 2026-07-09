import type { GameAdapter } from "../types";

// Second in build order — Bungie API is public/documented, light.gg has no
// public API so popularity data is semi-manual reference (spec section 4.4).
export const destiny2Adapter: GameAdapter = {
  gameId: "destiny2",
  async fetchPatchNotes(sinceDate) {
    throw new Error("not implemented");
  },
  async fetchRecommendedBuilds() {
    throw new Error("not implemented");
  },
};
