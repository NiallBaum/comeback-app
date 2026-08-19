import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { SUPPORTED_GAMES } from "@/lib/games"
import { getSteamHeaderUrl, getSteamHeaderArtPosition, getSteamGridArtUrl, getSteamHeaderUrlForAppId } from "@/lib/steam/assets";
import { resolveLibrary } from "@/lib/dashboard/library";
import { GameLibraryGrid, type LibraryEntry } from "@/components/dashboard/GameLibraryGrid";
import { buttonVariants } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-up");
  }

  const steamId = session.user.steamId;
  if (!steamId) {
    // Signed in (e.g. via email) but hasn't connected a game account yet -
    // nothing to show until they do. Only Steam is a real connection today;
    // Riot/Battle.net join this once those adapters exist.
    return (
      <main className="flex max-w-[1440px] w-full flex-1 mx-auto flex-col items-center justify-center px-4 py-8 text-center">
        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          // your library
        </span>
        <h1 className="mt-1 mb-3 text-3xl font-bold tracking-tight">Connect a game account</h1>
        <p className="mb-6 max-w-md text-muted-foreground">
          Your library shows up here once you&apos;ve connected at least one platform.
        </p>
        <Link
          href="/api/auth/steam/login"
          className={buttonVariants({
            size: "sm",
            className: "bg-brand text-brand-foreground hover:bg-brand/90",
          })}
        >
          Connect Steam
        </Link>
      </main>
    );
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