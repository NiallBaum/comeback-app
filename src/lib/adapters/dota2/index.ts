import type { GameAdapter } from "../types";
import type { BuildItem, BuildRecommendation } from "@/types";

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

interface HeroStat {
  id: number;
  localized_name: string;
  icon: string;
  pub_pick: number;
  pub_win: number;
}

interface ItemMeta {
  dname: string;
  img: string;
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
  async fetchRecommendedBuilds(heroName) {
    const results = await fetch("https://api.opendota.com/api/heroStats");

    const heroStats: HeroStat[] = await results.json();
    const meaningfulStats = heroStats.filter((hero) => hero.pub_pick >= 1000);
    let chosenHeroes: HeroStat[]

    if (heroName) {
      const match = heroStats.find(
        (hero) => hero.localized_name.toLowerCase() === heroName.toLowerCase()
      );
      if (!match) {
        throw new Error(`No Dota 2 hero found matching "${heroName}"`);
      }
      chosenHeroes = [match];
    } else {
      chosenHeroes = [...meaningfulStats]
      .sort((a, b) => b.pub_win / b.pub_pick - a.pub_win / a.pub_pick)
      .slice(0, 3);
    }

    const [itemIdsResults, itemMetaResults] = await Promise.all([
      fetch("https://api.opendota.com/api/constants/item_ids"),
      fetch("https://api.opendota.com/api/constants/items"),
    ]);
    const itemIds: Record<string, string> = await itemIdsResults.json();
    const itemMeta: Record<string, ItemMeta> = await itemMetaResults.json();

    function resolveItem(itemId: number): BuildItem {
      const internalName = itemIds[itemId];
      const meta = itemMeta[internalName];
      return {
        name: meta.dname,
        iconUrl: `https://cdn.cloudflare.steamstatic.com${meta.img}`,
      };
    }

    const buildRecommendations: BuildRecommendation[] = [];

    for (const hero of chosenHeroes) {
      const itemPopResults = await fetch(`https://api.opendota.com/api/heroes/${hero.id}/itemPopularity`);
      const itemPopularity: { late_game_items: Record<string, number> } = await itemPopResults.json();

      const topItemIds = Object.entries(itemPopularity.late_game_items)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([id]) => Number(id));

      const winRate = hero.pub_win / hero.pub_pick;

      buildRecommendations.push({
        gameId: "dota2",
        characterOrClass: hero.localized_name,
        label: `${hero.localized_name} Core Build`,
        items: topItemIds.map(resolveItem),
        whyItWorksNow: `${(winRate * 100).toFixed(1)}% win rate across ${hero.pub_pick.toLocaleString()} public matches this patch.`,
        confidence: "data-backed",
      });
    }

    return buildRecommendations;
  },
};
