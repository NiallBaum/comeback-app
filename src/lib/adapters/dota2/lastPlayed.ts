import { steam64ToSteam32 } from "@/lib/steam/ids";

interface LastPlayed {
  start_time: number;
  duration: number;
}

export async function getLastPlayedAt(steamId64: string): Promise<Date | null> {
  const steam32 = steam64ToSteam32(steamId64)

  const results = await fetch(`https://api.opendota.com/api/players/${steam32}/matches?limit=1`)

  const lastPlayed: LastPlayed[] = await results.json()

  if (lastPlayed.length === 0) return null

  return new Date((lastPlayed[0].start_time + lastPlayed[0].duration) * 1000)
}

