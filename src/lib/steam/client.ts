// Steam Web API client — GetOwnedGames / GetRecentlyPlayedGames (spec 4.1)
// Requires one server-side STEAM_WEB_API_KEY. Never expose it to the client.
interface SteamOwnedGamesResponse {
  response: {
    games?: {
      appid: number;
      name: string;
      playtime_forever: number;
      playtime_2weeks?: number;
      rtime_last_played?: number;
    }[];
  };
}
export interface OwnedGame {
  appId: number;
  name: string;
  playtimeForeverMinutes: number;
  playtimeLastTwoWeeksMinutes: number;
  lastPlayedAt: Date | null;
}

export async function getOwnedGames(steamId: string): Promise<OwnedGame[]> {
  // include_appinfo=true is required for `name` - only ever needed once the
  // dashboard started rendering a user's whole library, not just the 3
  // curated games (which already had their own display names from
  // src/lib/games.ts and never read this field before).
  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_WEB_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true&format=json`

  const response = (await fetch(url))
  const data = (await response.json()) as SteamOwnedGamesResponse;

  return (data.response.games ?? []).map((game) => ({
    appId: game.appid,
    name: game.name,
    playtimeForeverMinutes: game.playtime_forever,
    playtimeLastTwoWeeksMinutes: game.playtime_2weeks ?? 0,
    lastPlayedAt: game.rtime_last_played ? new Date(game.rtime_last_played * 1000) : null,
  }))
}
