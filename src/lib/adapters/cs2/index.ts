import type { GameAdapter } from "../types";
import type { BuildRecommendation } from "@/types";

interface SteamNewsItem {
  title: string;
  contents: string;
  date: number;
  feedname: string;
  tags?: string[];
}

interface SteamNewsResponse {
  appnews: {
    appid: number;
    newsitems: SteamNewsItem[]
  }
}

// CS2 has no item/loadout meta concept the way PoE/Dota do (cosmetic skins
// only, no power-affecting build choices) — see tech-spec.md Section 4.4.
// fetchRecommendedBuilds intentionally returns an empty array rather than
// synthesizing an opinion-based "build" section.
export const cs2Adapter: GameAdapter = {
  gameId: "cs2",
  async fetchPatchNotes(sinceDate) {
    const results = await fetch("https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=730&count=100&maxlength=0&format=json");

    const data: SteamNewsResponse = await results.json()
    const newsitems = data.appnews.newsitems;

    const sinceTimestamp = new Date(sinceDate).getTime()

    const patchNotes = newsitems.filter((item) => {
      return item.tags?.includes("patchnotes") && item.date * 1000 >= sinceTimestamp
    })

    return patchNotes.map((item) => ({
      gameId: "cs2",
      patchDate: new Date(item.date * 1000).toISOString().split("T")[0],
      rawTitle: item.title,
      rawBody: item.contents,
      tags: [],
    }));
  },
  async fetchRecommendedBuilds(): Promise<BuildRecommendation[]> {
    return [];
  },
};
