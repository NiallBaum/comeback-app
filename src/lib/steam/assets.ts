import type { GameId } from "@/types";

export const STEAM_APPIDS: Record<GameId, number> = {
  'cs2' : 730,
  'dota2' : 570,
  'poe' : 238960
}

export function getSteamHeaderUrl(gameId: GameId) {
  return getSteamHeaderUrlForAppId(STEAM_APPIDS[gameId]);
}

// Same CDN convention, but for any owned game's raw app id - not just the
// 3 curated ones. Valve's library_hero.jpg exists for effectively every
// app with store-page assets, no per-game lookup needed.
export function getSteamHeaderUrlForAppId(appId: number) {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/library_hero.jpg`
}

// library_hero.jpg reserves blank space on one side of the frame for the
// Steam client's own logo overlay - PoE and CS2's art sits in the right
// ~40% of the frame, Dota 2's spans the full width. Centralized here since
// every consumer of getSteamHeaderUrl needs the same crop treatment, not
// just the homepage (this fix previously only existed there).
export function getSteamHeaderArtPosition(gameId: GameId): string {
  return gameId === "dota2" ? "object-center" : "object-right";
}