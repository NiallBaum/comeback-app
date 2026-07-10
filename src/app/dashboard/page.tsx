import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/steam/session";
import { getOwnedGames } from "@/lib/steam/client";
import { SUPPORTED_GAMES } from "@/lib/games"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getSteamHeaderUrl } from "@/lib/steam/assets";

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
  <main>
    <h1>Dashboard</h1>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {matchedGames.map((game) => (
        <Card key={game.id} className="overflow-hidden pt-0">
          <div className="relative mb-4 overflow-hidden rounded-t-lg">
            <img
              src={getSteamHeaderUrl(game.id)}
              alt=""
              className="aspect-[16/6] w-full rounded-t-lg object-cover"
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
  </main>
);

}
