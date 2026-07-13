import type { PatchEntry, BuildRecommendation } from "@/types";
import type { GameAdapter } from "../types";
import { decodeSearchResult, parseDpsString } from "./ninjaProtobuf"
import * as cheerio from "cheerio";

interface PoeLeague {
  name: string;
  url: string;
  hardcore: boolean;
}

interface BuildIndexLeague {
  leagueName: string;
  leagueUrl: string;
  total: number;
  status: number;
  category: number;
  hardcore: boolean;
  statistics: { class: string; skill: string; percentage: number; trend: number }[];
}

interface BuildTarget {
  league: PoeLeague;
  class: string;
  skill: string;
}

interface BuildTargetsResult {
  metaTargets: BuildTarget[];
  fallbackLeagues: PoeLeague[];
}


interface TopCharacter {
  account: string;
  name: string;
}

interface CharacterItem {
  itemData: { name: string; typeLine: string; icon: string };
  itemSlot: number;
}

interface CharacterResponse {
  class: string;
  items: CharacterItem[];
  pathOfBuildingExport?: string;
}

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const BUILD_VERSION = "latest";

//poe.ninja has no build/ladder data for permanent Hardcore (404s on their own site)
const PERMANENT_LEAGUES: PoeLeague[] = [{ name: "Standard", url: "standard", hardcore: false }];

const BUILDS_PER_LEAGUE = 5


function getChallengeLeagues(leagueBuilds: BuildIndexLeague[]): PoeLeague[] {
  return leagueBuilds.filter(
    (l) =>
      l.category === 0 &&
      l.status === 0 &&
      !l.leagueUrl.includes("ssf") &&
      !l.leagueUrl.endsWith("r")
  )
  .map((l) => ({ name: l.leagueName, url: l.leagueUrl, hardcore: l.hardcore}));
}

function getOverviewName(league: PoeLeague): string {
  if (!league.hardcore) return league.url;
  return `hardcore-${league.url.replace(/hc$/, "")}`;
}

async function getBuildTargets(): Promise<BuildTargetsResult> {
  const response = await fetch("https://poe.ninja/poe1/api/data/build-index-state", {
    headers: { "User-Agent": BROWSER_USER_AGENT },
    cache: "no-store",
  });
  const data: { leagueBuilds: BuildIndexLeague[] } = await response.json();

  const leagues = [...PERMANENT_LEAGUES, ...getChallengeLeagues(data.leagueBuilds)];

  const metaTargets: BuildTarget[] = [];
  const fallbackLeagues: PoeLeague[] = [];

  for (const league of leagues) {
    const leagueData = data.leagueBuilds.find((i) => i.leagueUrl === league.url);

    if (!leagueData) continue

    if (leagueData.statistics.length === 0) {
      fallbackLeagues.push(league);
      continue;
    }

    const topStats = [...leagueData.statistics]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, BUILDS_PER_LEAGUE);

    for (const stat of topStats) {
      metaTargets.push({ league, class: stat.class, skill: stat.skill })
    }
  }

  return { metaTargets, fallbackLeagues };
}

async function getTopCharacters(league: PoeLeague, count: number): Promise<TopCharacter[]> {
  const url = new URL(`https://poe.ninja/poe1/api/builds/${BUILD_VERSION}/search`);
  url.searchParams.set("overview", getOverviewName(league));
  url.searchParams.set("type", "exp");

  const response = await fetch(url, { headers: { "User-Agent": BROWSER_USER_AGENT }, cache: "no-store" });
  const buf = Buffer.from(await response.arrayBuffer());
  const result = decodeSearchResult(buf);

  const dpsField = result.fields.find((f) => f.type === "dps");
  const names = result.valueLists["name"];
  const accounts = result.valueLists["account"];
  const dps = dpsField ? result.valueLists[dpsField.valueListIds[0]] : undefined;
  if (!names?.length) return [];

  const ranked = names
    .map((_, i) => ({ index: i, dps: parseDpsString(dps?.[i]?.str) }))
    .sort((a, b) => b.dps - a.dps)
    .slice(0, count);

  return ranked.map(({ index }) => ({ account: accounts[index].str!, name: names[index].str! }));
}


async function findTopCharacter(target: BuildTarget): Promise<TopCharacter | null> {
  const url = new URL(`https://poe.ninja/poe1/api/builds/${BUILD_VERSION}/search`);
  url.searchParams.set("class", target.class);
  url.searchParams.set("skills", target.skill);
  url.searchParams.set("overview", getOverviewName(target.league));
  url.searchParams.set("type", "exp");

  const response = await fetch(url, { headers: { "User-Agent": BROWSER_USER_AGENT }, cache: "no-store" });
  const buf = Buffer.from(await response.arrayBuffer());
  const result = decodeSearchResult(buf);

  const dpsField = result.fields.find((f) => f.type === "dps");
  const names = result.valueLists["name"];
  const accounts = result.valueLists["account"];
  const dps = dpsField ? result.valueLists[dpsField.valueListIds[0]] : undefined;
  if (!names?.length) return null;

  let bestIndex = 0;
  let bestDps = -Infinity;
  for (let i = 0; i < names.length; i++) {
    const value = parseDpsString(dps?.[i]?.str);
    if (value > bestDps) {
      bestDps = value;
      bestIndex = i;
    }
  }

  return { account: accounts[bestIndex].str!, name: names[bestIndex].str! };
}

async function getCharacterBuild(league: PoeLeague, character: TopCharacter): Promise<CharacterResponse | null> {
  const url = new URL(`https://poe.ninja/poe1/api/builds/${BUILD_VERSION}/character`);
  url.searchParams.set("account", character.account);
  url.searchParams.set("name", character.name);
  url.searchParams.set("overview", getOverviewName(league));
  url.searchParams.set("type", "0");
  url.searchParams.set("timeMachine", "");

  const response = await fetch(url, { headers: { "User-Agent": BROWSER_USER_AGENT }, cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

function toBuildRecommendation(league: PoeLeague, label: string, build: CharacterResponse): BuildRecommendation {
  return {
    gameId: "poe",
    characterOrClass: build.class,
    label,
    items: build.items.map((item) => ({
      name: item.itemData.name || item.itemData.typeLine,
      iconUrl: item.itemData.icon,
    })),
    whyItWorksNow: `Top-performing ${label} build currently in ${league.name}`,
    confidence: "data-backed",
    pobCode: build.pathOfBuildingExport,
    leagueMode: league.name,
  }
}

// Build first — poe.ninja gives real ladder data (spec section 4.4/9).
export const poeAdapter: GameAdapter = {
  gameId: "poe",

  async fetchPatchNotes(sinceDate) {
    const listResponse = await fetch("https://www.pathofexile.com/forum/view-forum/patch-notes", {
      headers: { "User-Agent": BROWSER_USER_AGENT },
      cache: "no-store",
    });
    const listHtml = await listResponse.text();
    const $ = cheerio.load(listHtml);

    const threads: { title: string; url: string; date: string }[] = [];
    $("table#view_forum_table tbody tr").each((_, row) => {
      const link = $(row).find(".thread .thread_title .title a");
      const title = link.text().trim();
      const url = link.attr("href");
      const dateText = $(row).find(".thread .postBy .post_date").text().replace(/^,\s*/, "");
      
      if (title && url && dateText) {
        threads.push({ title, url, date: dateText });
      }
    });
    
    const recentThreads = threads.filter((thread) => new Date(thread.date) >= new Date(sinceDate) )

    const patchEntries: PatchEntry[] = []

    for (const thread of recentThreads) {
      const threadResponse = await fetch(`https://www.pathofexile.com${thread.url}`, {
        headers: { "User-Agent": BROWSER_USER_AGENT },
        cache: "no-store",
      });
      const threadHtml = await threadResponse.text();
      const $$ = cheerio.load(threadHtml);

      const rawBody = $$("table.forumPostListTable tr").first().find("td.content-container .content").text().trim();

      patchEntries.push({
        gameId: "poe",
        patchDate: new Date(thread.date).toISOString().split("T")[0],
        rawTitle: thread.title,
        rawBody,
        tags: [],
      });
    }

    return patchEntries;
  },

  async fetchRecommendedBuilds() {
    const { metaTargets, fallbackLeagues } = await getBuildTargets();
    const recommendations: BuildRecommendation[] = [];

    for (const target of metaTargets) {
      const top = await findTopCharacter(target);
      if (!top) continue;
      const build = await getCharacterBuild(target.league, top);
      if (!build) continue;
      recommendations.push(toBuildRecommendation(target.league, target.skill, build));
    }

    for (const league of fallbackLeagues) {
      const tops = await getTopCharacters(league, BUILDS_PER_LEAGUE);
      for (const top of tops) {
        const build = await getCharacterBuild(league, top);
        if (!build) continue;
        recommendations.push(toBuildRecommendation(league, build.class, build));
      }
    }

    return recommendations;
  },
};
