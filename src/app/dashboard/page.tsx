import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { SUPPORTED_GAMES } from "@/lib/games"
import { getSteamHeaderUrl, getSteamHeaderArtPosition, getSteamGridArtUrl, getSteamHeaderUrlForAppId } from "@/lib/steam/assets";
import { resolveLibrary } from "@/lib/dashboard/library";
import { GameLibraryGrid, type LibraryEntry } from "@/components/dashboard/GameLibraryGrid";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-up");
  }

  const steamId = session.user.steamId;
  if (!steamId) {
    // Signed in (e.g. via email) but hasn't connected Steam yet - nothing
    // to show until they do. Linking a platform to an already-signed-in
    // account isn't built yet (see plan), so this just sends them back to
    // start a Steam connection, same as a fresh visitor for now.
    redirect("/sign-up");
  }

  const { matchedGames, otherOwnedGames } = await resolveLibrary(steamId);

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