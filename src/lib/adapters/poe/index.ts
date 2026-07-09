import type { GameAdapter } from "../types";

// Build first — poe.ninja gives real ladder data (spec section 4.4/9).
export const poeAdapter: GameAdapter = {
  gameId: "poe",
  async fetchPatchNotes(sinceDate) {
    throw new Error("not implemented");
  },
  async fetchRecommendedBuilds() {
    throw new Error("not implemented");
  },
};
