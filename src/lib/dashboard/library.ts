import { SUPPORTED_GAMES } from "@/lib/games";
import { getOwnedGames } from "@/lib/steam/client";
import { getLastPlayedAtWithCache } from "@/lib/cache/lastPlayed";
import type { OwnedGame } from "@/lib/steam/client";
import type { GameConfig } from "@/lib/games";
import type { GameId } from "@/types";

export type MatchedGame = {
  id: GameId;
  name: string;
  steamAppId: number;
  lastPlayedAt: Date | null;
  // "steam" = confirmed via GetOwnedGames. "opendota" = Steam didn't confirm
  // it (the known ownership bug), but OpenDota has real match history for
  // this account - for a free-to-play game, that's better evidence of
  // genuine play than Steam's license-record formality ever was.
  confirmedVia: "steam" | "opendota";
};

// Soft cap on the "rest of your library" tier - a real account can own
// hundreds of games, and this tier is patch-notes-only (no personalization),
// so surfacing the most-recently-played ones is more useful than an
// unbounded, mostly-irrelevant wall of titles.
const OTHER_GAMES_LIMIT = 20;

// Shared between the browse grid (/dashboard) and a per-game page
// (/dashboard/[game]) - both need the same curated-vs-generic ownership
// resolution, so this is the one place that logic lives.
export async function resolveLibrary(steamId: string): Promise<{
  matchedGames: MatchedGame[];
  unmatchedGames: GameConfig[];
  otherOwnedGames: OwnedGame[];
}> {
  const ownedGames = await getOwnedGames(steamId);

  const matchedGames: MatchedGame[] = [];
  for (const config of SUPPORTED_GAMES) {
    const owned = ownedGames.find((g) => g.appId === config.steamAppId);
    if (owned) {
      matchedGames.push({ ...config, lastPlayedAt: owned.lastPlayedAt, confirmedVia: "steam" });
      continue;
    }

    // Steam's ownership API occasionally doesn't report a game a player
    // genuinely owns (confirmed real-world case for Dota 2, not something we
    // can detect or correct from the API response alone). For Dota 2
    // specifically, OpenDota's own match history is a real alternate source -
    // if it has real matches for this account, treat it as confirmed too,
    // rather than knee-capping the whole feature over a Steam formality that
    // doesn't matter much for a free-to-play game.
    if (config.id === "dota2") {
      try {
        const lastPlayedAt = await getLastPlayedAtWithCache(steamId);
        if (lastPlayedAt) {
          matchedGames.push({ ...config, lastPlayedAt, confirmedVia: "opendota" });
          continue;
        }
      } catch {
        // OpenDota unreachable - falls through to unmatched below, same as
        // if Steam and OpenDota both genuinely have nothing.
      }
    }
  }

  // Anything left here has no evidence from either source - offered as a
  // manual, clearly-labeled "view anyway" option.
  const unmatchedGames = SUPPORTED_GAMES.filter(
    (config) => !matchedGames.some((game) => game.id === config.id),
  );

  // Every other owned game (outside the 3 curated ones) - the free,
  // universal, patch-notes-only tier. Sorted by most recently played first,
  // since that's the most relevant ordering for "what changed while you
  // were gone."
  const curatedAppIds = new Set(SUPPORTED_GAMES.map((g) => g.steamAppId));
  const otherOwnedGames = ownedGames
    .filter((g) => !curatedAppIds.has(g.appId))
    // Beta/test builds are usually a separate app id for the same game the
    // player already owns properly - just noise in a "what changed" library.
    .filter((g) => !/\bbeta\b/i.test(g.name))
    .sort((a, b) => (b.lastPlayedAt?.getTime() ?? 0) - (a.lastPlayedAt?.getTime() ?? 0))
    .slice(0, OTHER_GAMES_LIMIT);

  return { matchedGames, unmatchedGames, otherOwnedGames };
}
