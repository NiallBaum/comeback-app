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
import { cs2Adapter } from "@/lib/adapters/cs2";
import type { GameAdapter } from "@/lib/adapters/types";
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

async function SelectedGamePanel({ game }: { game: MatchedGame }) {
  const builds = await getBuildsWithCache(ADAPTERS[game.id]);

  if (builds.length > 0) {
    return (
      <>
        <span className="mb-4 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
          // recommended builds — {game.name.toLowerCase()}
        </span>
        <BuildPicker builds={builds} />
      </>
    );
  }

  const sinceDate = new Date(Date.now() - PATCH_NOTES_SINCE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const patchNotes = await ADAPTERS[game.id].fetchPatchNotes(sinceDate);

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

  const { game: requestedGameId } = await searchParams;
  const selectedGame = matchedGames.find((g) => g.id === requestedGameId) ?? matchedGames[0];

  return (
    <main className="max-w-[1440px] w-full mx-auto px-4 py-8">
      <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
        // your library
      </span>
      <h1 className="mt-1 mb-8 text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matchedGames.map((game) => {
          const isActive = game.id === selectedGame?.id;
          return (
            <Link key={game.id} href={`/dashboard?game=${game.id}`} className="block">
              <Card
                className={`overflow-hidden rounded-none pt-0 transition-shadow ${CLIP_PATH} ${
                  isActive ? "ring-2 ring-brand" : "hover:ring-1 hover:ring-brand/50"
                }`}
              >
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
            </Link>
          );
        })}
      </div>

      {selectedGame && (
        <div className="mt-12 max-w-[900px] mx-auto">
          <SelectedGamePanel game={selectedGame} />
        </div>
      )}
    </main>
  );

}
