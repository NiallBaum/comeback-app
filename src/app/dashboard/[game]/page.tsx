import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { SUPPORTED_GAMES } from "@/lib/games";
import { resolveLibrary } from "@/lib/dashboard/library";
import { SelectedGamePanel, type ActiveGameInfo } from "@/components/dashboard/SelectedGamePanel";

export default async function GamePage({
  params,
  searchParams,
}: {
  params: Promise<{ game: string }>;
  searchParams: Promise<{ hero?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-up");
  }

  const steamId = session.user.steamId;
  if (!steamId) {
    // Same "not linked yet" case as the library grid - see the comment
    // there for why this just bounces to /sign-up rather than a settings
    // flow that doesn't exist yet.
    redirect("/sign-up");
  }

  const { game: gameParam } = await params;
  const { hero: heroParam } = await searchParams;

  const { matchedGames, unmatchedGames, otherOwnedGames } = await resolveLibrary(steamId);

  const requestedMatched = matchedGames.find((g) => g.id === gameParam);
  const requestedUnmatched = unmatchedGames.find((g) => g.id === gameParam);
  const requestedGeneric = otherOwnedGames.find((g) => String(g.appId) === gameParam);

  let activeGameInfo: ActiveGameInfo | undefined;
  let activeGameLastPlayedAt: Date | null = null;
  let activeGameUnconfirmed = false;

  if (requestedMatched) {
    activeGameInfo = { kind: "curated", config: requestedMatched, unconfirmed: false };
    activeGameLastPlayedAt = requestedMatched.lastPlayedAt;
  } else if (requestedUnmatched) {
    activeGameInfo = { kind: "curated", config: requestedUnmatched, unconfirmed: true };
    activeGameUnconfirmed = true;
  } else if (requestedGeneric) {
    activeGameInfo = { kind: "generic", appId: requestedGeneric.appId, name: requestedGeneric.name };
    activeGameLastPlayedAt = requestedGeneric.lastPlayedAt;
  }

  // Not a curated game and not in this account's (capped) generic library -
  // nothing real to show, so bounce back to the browse grid rather than a
  // broken-looking empty page.
  if (!activeGameInfo) {
    redirect("/dashboard");
  }

  const activeGameName = activeGameInfo.kind === "curated" ? activeGameInfo.config.name : activeGameInfo.name;

  return (
    <main className="max-w-[900px] w-full mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link
          href="/dashboard"
          className="font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Your library
        </Link>
        <div className="ml-auto flex gap-2">
          {SUPPORTED_GAMES.map((config) => {
            const isActive = activeGameInfo.kind === "curated" && activeGameInfo.config.id === config.id;
            return (
              <Link
                key={config.id}
                href={`/dashboard/${config.id}`}
                className={`border px-2.5 py-1 font-mono text-xs uppercase tracking-wide transition-colors ${
                  isActive
                    ? "border-brand/45 bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {config.name}
              </Link>
            );
          })}
        </div>
      </div>

      {activeGameUnconfirmed && (
        <p className="mb-6 font-mono text-xs text-muted-foreground">
          <span className="text-brand">// preview mode</span> — Steam hasn&apos;t confirmed {activeGameName} is linked to your account, but everything below comes from a different, independent source, so it&apos;s just as real as any other game.
        </p>
      )}

      <SelectedGamePanel
        game={activeGameInfo}
        lastPlayedAt={activeGameLastPlayedAt}
        steamId={steamId}
        heroParam={heroParam}
      />
    </main>
  );
}
