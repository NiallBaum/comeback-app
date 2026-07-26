import { steam64ToSteam32 } from "@/lib/steam/ids";
import { getHeroStats } from ".";

interface PlayerHeroStat {
  hero_id: number;
  games: number;
}

export async function detectMainHero(steamId64: string): Promise<string> {
  const steam32 = steam64ToSteam32(steamId64);

  const results = await fetch(`https://api.opendota.com/api/players/${steam32}/heroes`);
  const playerHeroes: PlayerHeroStat[] = await results.json();

  const topHero = [...playerHeroes].sort((a, b) => b.games - a.games)[0];

  const heroStats = await getHeroStats();
  const match = heroStats.find((hero) => hero.id === topHero.hero_id);
  if (!match) {
    throw new Error(`Could not resolve hero_id ${topHero.hero_id} to a hero name`);
  }

  return match.localized_name;
}