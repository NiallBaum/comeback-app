import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/steam/session";
import { getOwnedGames } from "@/lib/steam/client";
import { SUPPORTED_GAMES } from "@/lib/games"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getSteamHeaderUrl, getSteamHeaderArtPosition } from "@/lib/steam/assets";
import { getBuildsWithCache } from "@/lib/cache/builds";
import { poeAdapter } from "@/lib/adapters/poe";
import { dota2Adapter } from "@/lib/adapters/dota2";
import { BuildPicker } from "@/components/build-picker/BuildPicker";
import { PatchNotesList } from "@/components/dashboard/PatchNotesList";
import { PatchHighlights } from "@/components/dashboard/PatchHighlights";
import { cs2Adapter } from "@/lib/adapters/cs2";
import { getPatchNotesWithCache } from "@/lib/cache/patchNotes";
import { Dota2Persona } from "@/components/dashboard/Dota2Persona";
import { getLastPlayedAtWithCache } from "@/lib/cache/lastPlayed";
import { getPatchHighlights } from "@/lib/patchNotes";
import type { GameAdapter } from "@/lib/adapters/types";
import type { GameConfig } from "@/lib/games";
import type { GameId } from "@/types";

const ADAPTERS: Record<GameId, GameAdapter> = {
  poe: poeAdapter,
  dota2: dota2Adapter,
  cs2: cs2Adapter
}

const CLIP_PATH = "[clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]";

// Fallback window for games with no real Steam last-played timestamp
// (unconfirmed/manual "view anyway" games - see unmatchedGames below).
const FALLBACK_SINCE_DAYS = 180;

type MatchedGame = {
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

function daysSince(date: Date): number {
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000)));
}

// "today" / "yesterday" / "N days" - reads more naturally than "0 days
// since you last played" for someone who played earlier today.
function sincePhrase(lastPlayedAt: Date): string {
  const days = daysSince(lastPlayedAt);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

async function SelectedGamePanel({
  game,
  lastPlayedAt,
  steamId,
  heroParam,
}: {
  game: GameConfig;
  lastPlayedAt: Date | null;
  steamId: string;
  heroParam?: string;
}) {
  const sinceDate = (
    lastPlayedAt ?? new Date(Date.now() - FALLBACK_SINCE_DAYS * 24 * 60 * 60 * 1000)
  ).toISOString();
  const [builds, patchNotes] = await Promise.all([
    getBuildsWithCache(ADAPTERS[game.id]),
    getPatchNotesWithCache(ADAPTERS[game.id], sinceDate),
  ]);

  const headline = lastPlayedAt
    ? `you last played ${game.name.toLowerCase()} ${sincePhrase(lastPlayedAt)}`
    : builds.length > 0
      ? `recommended builds — ${game.name.toLowerCase()}`
      : `patch notes — ${game.name.toLowerCase()}`;

  const persona = game.id === "dota2" && (
    <Dota2Persona steamId={steamId} heroParam={heroParam} patchNotes={patchNotes} />
  );

  if (builds.length > 0) {
    return (
      <>
        {persona}
        <PatchHighlights gameName={game.name} entries={patchNotes} />
        <span className="mb-4 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
          // {headline}
        </span>
        <BuildPicker builds={builds} />
      </>
    );
  }

  // Same condensed "highlights + expand" treatment as the builds branch
  // above - only falls back to the full unconditional list when there's
  // truly nothing bullet-shaped to condense (empty history, or patches
  // that are pure prose/headers), so an expand-to-reveal never hides real
  // content behind a click for no reason.
  const hasHighlights = getPatchHighlights(patchNotes).length > 0;

  return (
    <>
      {persona}
      <span className="mb-4 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
        // {headline}
      </span>
      {hasHighlights ? (
        <PatchHighlights gameName={game.name} entries={patchNotes} />
      ) : (
        <PatchNotesList gameName={game.name} entries={patchNotes} />
      )}
    </>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string; hero?: string }>;
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    redirect("/api/auth/steam/login");
  }

  const session = await verifySession(token);
  if (session.status !== "valid") {
    redirect("/api/auth/steam/login")
  }

  const ownedGames = await getOwnedGames(session.steamId)

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
        const lastPlayedAt = await getLastPlayedAtWithCache(session.steamId);
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
  // manual, clearly-labeled "view anyway" option below the real grid.
  const unmatchedGames = SUPPORTED_GAMES.filter(
    (config) => !matchedGames.some((game) => game.id === config.id),
  );

  const { game: requestedGameId, hero: heroParam } = await searchParams;
  const requestedMatched = matchedGames.find((g) => g.id === requestedGameId);
  const requestedUnmatched = unmatchedGames.find((g) => g.id === requestedGameId);
  const activeGame: GameConfig | undefined = requestedMatched ?? requestedUnmatched ?? matchedGames[0];
  const activeGameUnconfirmed = !requestedMatched && !!requestedUnmatched;
  const activeGameLastPlayedAt = activeGameUnconfirmed
    ? null
    : (requestedMatched ?? matchedGames[0])?.lastPlayedAt ?? null;

  return (
    <main className="max-w-[1440px] w-full mx-auto px-4 py-8">
      <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
        // your library
      </span>
      <h1 className="mt-1 mb-8 text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SUPPORTED_GAMES.map((config) => {
          const matched = matchedGames.find((game) => game.id === config.id);
          const isActive = config.id === activeGame?.id;
          return (
            <Link key={config.id} href={`/dashboard?game=${config.id}`} className="block">
              <div
                className={`p-px transition-colors ${CLIP_PATH} ${
                  isActive ? "bg-brand" : "bg-transparent hover:bg-brand/50"
                }`}
              >
                <Card className={`overflow-hidden rounded-none pt-0 ${CLIP_PATH}`}>
                  <div className="relative mb-4 overflow-hidden">
                    <img
                      src={getSteamHeaderUrl(config.id)}
                      alt=""
                      className={`aspect-[16/6] w-full object-cover ${getSteamHeaderArtPosition(config.id)} ${matched ? "" : "opacity-60 grayscale"}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent to-15%" />
                    {isActive ? (
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-brand px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-brand-foreground">
                        {matched ? "Viewing" : "Previewing"}
                      </span>
                    ) : (
                      !matched && (
                        <span className="absolute top-2.5 right-2.5 rounded-full border border-border bg-background/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                          Preview
                        </span>
                      )
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{config.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {matched ? (
                      matched.lastPlayedAt && (
                        <p className="text-muted-foreground">
                          last played {sincePhrase(matched.lastPlayedAt)}
                        </p>
                      )
                    ) : (
                      <p className="text-muted-foreground">
                        Not linked to your account — click to preview real data anyway.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </Link>
          );
        })}
      </div>

      {activeGame && (
        <div className="mt-12 max-w-[900px] mx-auto">
          {activeGameUnconfirmed && (
            <p className="mb-6 font-mono text-xs text-muted-foreground">
              <span className="text-brand">// preview mode</span> — Steam hasn't confirmed {activeGame.name} is linked to your account, but everything below comes from a different, independent source, so it's just as real as any other game.
            </p>
          )}
          <SelectedGamePanel
            game={activeGame}
            lastPlayedAt={activeGameLastPlayedAt}
            steamId={session.steamId}
            heroParam={heroParam}
          />
        </div>
      )}
    </main>
  );

}
