import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/steam/session";
import { SUPPORTED_GAMES } from "@/lib/games"
import { getSteamHeaderUrl, getSteamHeaderArtPosition, getSteamGridArtUrl, getSteamHeaderUrlForAppId } from "@/lib/steam/assets";
import { resolveLibrary } from "@/lib/dashboard/library";
import { GameLibraryGrid, type LibraryEntry } from "@/components/dashboard/GameLibraryGrid";

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

  const { matchedGames, otherOwnedGames } = await resolveLibrary(session.steamId);

  const curatedEntries: LibraryEntry[] = SUPPORTED_GAMES.map((config) => {
    const matched = matchedGames.find((game) => game.id === config.id);
    return {
      key: config.id,
      name: config.name,
      imageUrl: getSteamHeaderUrl(config.id),
      artPosition: getSteamHeaderArtPosition(config.id),
      lastPlayedAt: matched?.lastPlayedAt ?? null,
      curated: true,
      matched: !!matched,
      href: `/dashboard/${config.id}`,
      isActive: false,
    };
  });

  const genericEntries: LibraryEntry[] = otherOwnedGames.map((owned) => ({
    key: String(owned.appId),
    name: owned.name,
    imageUrl: getSteamGridArtUrl(owned.appId),
    fallbackImageUrl: getSteamHeaderUrlForAppId(owned.appId),
    artPosition: "",
    lastPlayedAt: owned.lastPlayedAt,
    curated: false,
    matched: true,
    href: `/dashboard/${owned.appId}`,
    isActive: false,
  }));

  return (
    <main className="max-w-[1440px] w-full mx-auto px-4 py-8">
      <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
        // your library
      </span>
      <h1 className="mt-1 mb-8 text-3xl font-bold tracking-tight">Dashboard</h1>

      <GameLibraryGrid entries={[...curatedEntries, ...genericEntries]} />
    </main>
  );
}
