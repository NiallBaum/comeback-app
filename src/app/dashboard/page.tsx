import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/steam/session";
import { getOwnedGames } from "@/lib/steam/client";
import { SUPPORTED_GAMES } from "@/lib/games"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getSteamHeaderUrl } from "@/lib/steam/assets";
import { getBuildsWithCache } from "@/lib/cache/builds";
import { poeAdapter } from "@/lib/adapters/poe";
import { dota2Adapter } from "@/lib/adapters/dota2";
import { BuildPicker } from "@/components/build-picker/BuildPicker";
import { PatchNotesList } from "@/components/dashboard/PatchNotesList";
import { PatchHighlights } from "@/components/dashboard/PatchHighlights";
import { cs2Adapter } from "@/lib/adapters/cs2";
import type { GameAdapter } from "@/lib/adapters/types";
import type { GameConfig } from "@/lib/games";
import type { GameId } from "@/types";

const ADAPTERS: Record<GameId, GameAdapter> = {
  poe: poeAdapter,
  dota2: dota2Adapter,
  cs2: cs2Adapter
}

const CLIP_PATH = "[clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]";

// Placeholder window until the real "confirm when you last played" flow
// (tech-spec.md Section 5) exists.
const PATCH_NOTES_SINCE_DAYS = 180;

type MatchedGame = { id: GameId; name: string; steamAppId: number; playtimeForeverMinutes: number; playtimeLastTwoWeeksMinutes: number };

async function SelectedGamePanel({ game }: { game: GameConfig }) {
  const sinceDate = new Date(Date.now() - PATCH_NOTES_SINCE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const [builds, patchNotes] = await Promise.all([
    getBuildsWithCache(ADAPTERS[game.id]),
    ADAPTERS[game.id].fetchPatchNotes(sinceDate),
  ]);

  if (builds.length > 0) {
    return (
      <>
        <PatchHighlights gameName={game.name} entries={patchNotes} />
        <span className="mb-4 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
          // recommended builds — {game.name.toLowerCase()}
        </span>
        <BuildPicker builds={builds} />
      </>
    );
  }

  return (
    <>
      <span className="mb-4 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
        // patch notes — {game.name.toLowerCase()}
      </span>
      <PatchNotesList gameName={game.name} entries={patchNotes} />
    </>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>;
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
      matchedGames.push({ ...config, ...owned });
    }
  }

  // Steam's ownership API occasionally doesn't report a game a player
  // genuinely owns (confirmed real-world case, not something we can detect
  // or correct from the API response alone) - rather than silently omitting
  // it with no explanation, supported games it didn't confirm get offered
  // as a manual, clearly-labeled "view anyway" option below the real grid.
  const unmatchedGames = SUPPORTED_GAMES.filter(
    (config) => !matchedGames.some((game) => game.id === config.id),
  );

  const { game: requestedGameId } = await searchParams;
  const requestedMatched = matchedGames.find((g) => g.id === requestedGameId);
  const requestedUnmatched = unmatchedGames.find((g) => g.id === requestedGameId);
  const activeGame: GameConfig | undefined = requestedMatched ?? requestedUnmatched ?? matchedGames[0];
  const activeGameUnconfirmed = !requestedMatched && !!requestedUnmatched;

  return (
    <main className="max-w-[1440px] w-full mx-auto px-4 py-8">
      <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
        // your library
      </span>
      <h1 className="mt-1 mb-8 text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matchedGames.map((game) => {
          const isActive = !activeGameUnconfirmed && game.id === activeGame?.id;
          return (
            <Link key={game.id} href={`/dashboard?game=${game.id}`} className="block">
              <div
                className={`p-px transition-colors ${CLIP_PATH} ${
                  isActive ? "bg-brand" : "bg-transparent hover:bg-brand/50"
                }`}
              >
                <Card className={`overflow-hidden rounded-none pt-0 ${CLIP_PATH}`}>
                  <div className="relative mb-4 overflow-hidden">
                    <img
                      src={getSteamHeaderUrl(game.id)}
                      alt=""
                      className="aspect-[16/6] w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent to-15%" />
                    {isActive && (
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-brand px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-brand-foreground">
                        Viewing
                      </span>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{game.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {Math.round(game.playtimeForeverMinutes / 60)} hours played
                    </p>
                  </CardContent>
                </Card>
              </div>
            </Link>
          );
        })}
      </div>

      {unmatchedGames.length > 0 && (
        <div className="mt-8">
          <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            // don't see a game you own?
          </span>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Steam's ownership API doesn't always report every owned game accurately. If you own one of these, you can view it anyway.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {unmatchedGames.map((game) => (
              <Link
                key={game.id}
                href={`/dashboard?game=${game.id}`}
                className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors ${
                  activeGameUnconfirmed && activeGame?.id === game.id
                    ? "border-brand text-brand"
                    : "border-border text-muted-foreground hover:border-brand/50 hover:text-foreground"
                }`}
              >
                {game.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeGame && (
        <div className="mt-12 max-w-[900px] mx-auto">
          {activeGameUnconfirmed && (
            <div className={`mb-6 border border-border bg-card p-4 ${CLIP_PATH}`}>
              <span className="font-mono text-xs uppercase tracking-wide text-brand">// unconfirmed</span>
              <p className="mt-1 text-sm text-muted-foreground">
                Steam didn't report {activeGame.name} as owned on your account, so we can't confirm this automatically — showing it anyway since you asked.
              </p>
            </div>
          )}
          <SelectedGamePanel game={activeGame} />
        </div>
      )}
    </main>
  );

}
