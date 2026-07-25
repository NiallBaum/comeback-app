import type { GameAdapter } from "../types";

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

export const dota2Adapter: GameAdapter = {
  gameId: "dota2",
  async fetchPatchNotes(sinceDate) {
    const results = await fetch("https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=570&count=100&maxlength=0&format=json");

    const data: SteamNewsResponse = await results.json()
    const newsitems = data.appnews.newsitems;

    const sinceTimestamp = new Date(sinceDate).getTime()

    const patchNotes = newsitems.filter((item) => {
      return item.tags?.includes("patchnotes") && item.date * 1000 >= sinceTimestamp
    })

    return patchNotes.map((item) => ({
      gameId: "dota2",
      patchDate: new Date(item.date * 1000).toISOString().split("T")[0],
      rawTitle: item.title,
      rawBody: item.contents,
      tags: [],
    }));

  },
  async fetchRecommendedBuilds() {
    throw new Error("not implemented");
  },
};
