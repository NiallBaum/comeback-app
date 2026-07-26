import { steam64ToSteam32 } from "@/lib/steam/ids";
import { getHeroStats } from ".";

export interface PlaystyleProfile {
  goldPerMin: number;
  xpPerMin: number;
  heroDamage: number;
  heroHealing: number;
  wardsPlaced: number;
  kda: number;
}

interface TotalsField {
  field: string;
  n: number;
  sum: number;
}

export async function getPlaystyleProfile(steamId64: string, heroName: string) {
  const steam32 = steam64ToSteam32(steamId64);
  const heroStats = await getHeroStats();
  const hero = heroStats.find(
    (h) => h.localized_name.toLocaleLowerCase() === heroName.toLocaleLowerCase()
  );
  if (!hero) {
    throw new Error(`No Dota 2 hero found matching "${heroName}"`)
  }

  const results = await fetch(`https://api.opendota.com/api/players/${steam32}/totals?hero_id=${hero.id}`)


}
