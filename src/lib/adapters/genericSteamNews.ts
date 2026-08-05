import type { PatchEntry } from "@/types";

// Shared by any Steam game's patch notes - curated adapters (Dota 2, CS2)
// and the generic library-wide (non-curated) path both call this. Valve's
// ISteamNews endpoint works for any app id with zero per-game setup.
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
    newsitems: SteamNewsItem[];
  };
}

export async function fetchGenericPatchNotes(
  appId: number,
  sinceDate: string,
  gameId: string = String(appId)
): Promise<PatchEntry[]> {
  const results = await fetch(
    `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${appId}&count=100&maxlength=0&format=json`
  );

  const data: SteamNewsResponse = await results.json();
  const newsitems = data.appnews.newsitems;

  const sinceTimestamp = new Date(sinceDate).getTime();

  const patchNotes = newsitems.filter((item) => {
    return item.tags?.includes("patchnotes") && item.date * 1000 >= sinceTimestamp;
  });

  return patchNotes.map((item) => ({
    gameId,
    patchDate: new Date(item.date * 1000).toISOString().split("T")[0],
    rawTitle: item.title,
    rawBody: item.contents,
    tags: [],
  }));
}
