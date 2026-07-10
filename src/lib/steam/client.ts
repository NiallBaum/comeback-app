// Steam Web API client — GetOwnedGames / GetRecentlyPlayedGames (spec 4.1)
// Requires one server-side STEAM_WEB_API_KEY. Never expose it to the client.
interface SteamOwnedGamesResponse {
  response: {
    games?: {
      appid: number;
      playtime_forever: number;
      playtime_2weeks?: number;
    }[];
  };
}
export interface OwnedGame {
  appId: number;
  playtimeForeverMinutes: number;
  playtimeLastTwoWeeksMinutes: number;
}

export async function getOwnedGames(steamId: string): Promise<OwnedGame[]> {
  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_WEB_API_KEY}&steamid=${steamId}&include_appinfo=false&include_played_free_games=true&format=json`

  const response = (await fetch(url))
  const data = (await response.json()) as SteamOwnedGamesResponse;

  return (data.response.games ?? []).map((game) => ({
    appId: game.appid,
    playtimeForeverMinutes: game.playtime_forever,
    playtimeLastTwoWeeksMinutes: game.playtime_2weeks ?? 0
  }))
}
