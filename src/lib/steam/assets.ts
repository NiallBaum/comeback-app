import type { GameId } from "@/types";

export const STEAM_APPIDS: Record<GameId, number> = {
  'dbd' : 381210,
  'destiny2' : 1085660,
  'poe' : 238960
}

export function getSteamHeaderUrl(gameId: GameId) {
  const appid =  STEAM_APPIDS[gameId]

  return `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`
}