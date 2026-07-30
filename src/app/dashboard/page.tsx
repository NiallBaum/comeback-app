import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/steam/session";
import { getOwnedGames } from "@/lib/steam/client";
import { SUPPORTED_GAMES } from "@/lib/games"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getSteamHeaderUrl } from "@/lib/steam/assets";
import { getBuildsWithCache } from "@/lib/cache/builds";
import { poeAdapter } from "@/lib/adapters/poe";
import { dota2Adapter } from "@/lib/adapters/dota2";
import { BuildPicker } from "@/components/build-picker/BuildPicker";
import { cs2Adapter } from "@/lib/adapters/cs2";
import type { GameAdapter } from "@/lib/adapters/types";
import type { GameId } from "@/types";

const ADAPTERS: Record<GameId, GameAdapter> = {
  poe: poeAdapter,
  dota2: dota2Adapter,
  cs2: cs2Adapter
}

export default async function DashboardPage() {
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

  const matchedGames = [];
  for (const config of SUPPORTED_GAMES) {
    const owned = ownedGames.find((g) => g.appId === config.steamAppId);
    if (owned) {
      matchedGames.push({ ...config, ...owned });
    }
  }

  return (
    <main className="max-w-[1440px] w-full mx-auto px-4 py-8">
      <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
        // your library
      </span>
      <h1 className="mt-1 mb-8 text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matchedGames.map((game) => (
          <Card
            key={game.id}
            className="overflow-hidden pt-0 [clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]"
          >
            <div className="relative mb-4 overflow-hidden">
              <img
                src={getSteamHeaderUrl(game.id)}
                alt=""
                className="aspect-[16/6] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent to-15%" />
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
        ))}
      </div>

      <span className="mt-12 mb-4 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
        // recommended builds
      </span>
      <div className="max-w-[900px] mx-auto flex flex-col gap-8">
        {await Promise.all(
          matchedGames.map(async (game) => {
            const builds = await getBuildsWithCache(ADAPTERS[game.id]);
            return builds.length > 0 ? <BuildPicker key={game.id} builds={builds} /> : null;
          })
        )}
      </div>
    </main>
  );

}