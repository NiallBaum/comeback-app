// Steam Web API client — GetOwnedGames / GetRecentlyPlayedGames (spec 4.1)
// Requires one server-side STEAM_WEB_API_KEY. Never expose it to the client.

export interface OwnedGame {
  appId: number;
  playtimeForeverMinutes: number;
  playtimeLastTwoWeeksMinutes: number;
}

export async function getOwnedGames(steamId: string): Promise<OwnedGame[]> {
  throw new Error("not implemented");
}
