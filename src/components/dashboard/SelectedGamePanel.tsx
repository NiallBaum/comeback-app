import { getBuildsWithCache } from "@/lib/cache/builds";
import { poeAdapter } from "@/lib/adapters/poe";
import { dota2Adapter } from "@/lib/adapters/dota2";
import { BuildPicker } from "@/components/build-picker/BuildPicker";
import { PatchNotesList } from "@/components/dashboard/PatchNotesList";
import { PatchHighlights } from "@/components/dashboard/PatchHighlights";
import { cs2Adapter } from "@/lib/adapters/cs2";
import { getPatchNotesWithCache, getGenericPatchNotesWithCache } from "@/lib/cache/patchNotes";
import { Dota2Persona } from "@/components/dashboard/Dota2Persona";
import { ReinstallRecapTeaser } from "@/components/dashboard/ReinstallRecapTeaser";
import { getPatchHighlights } from "@/lib/patchNotes";
import { getSteamHeaderUrl, getSteamHeaderArtPosition, getSteamHeaderUrlForAppId } from "@/lib/steam/assets";
import type { GameAdapter } from "@/lib/adapters/types";
import type { GameConfig } from "@/lib/games";
import type { GameId } from "@/types";

const ADAPTERS: Record<GameId, GameAdapter> = {
  poe: poeAdapter,
  dota2: dota2Adapter,
  cs2: cs2Adapter,
};

// Fallback window for games with no real Steam last-played timestamp
// (unconfirmed/manual "view anyway" games).
const FALLBACK_SINCE_DAYS = 180;

// A selected game is either one of the 3 curated (personalized) games, or
// any other owned game rendered through the generic patch-notes-only path -
// see src/lib/cache/patchNotes.ts's getGenericPatchNotesWithCache.
export type ActiveGameInfo =
  | { kind: "curated"; config: GameConfig; unconfirmed: boolean }
  | { kind: "generic"; appId: number; name: string };

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

// Real per-game art at the top of every game page - previously only ever
// shown when BuildPicker rendered (which happens to include its own header
// banner), so a curated game with no builds (CS2) rendered as plain text
// with no imagery at all. This belongs to the game being viewed, not to
// whether it happens to have build recommendations.
function GameBanner({ imageUrl, artPosition }: { imageUrl: string; artPosition: string }) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-t-lg">
      <img src={imageUrl} alt="" className={`aspect-16/6 w-full object-cover ${artPosition}`} />
      <div className="absolute inset-0 bg-linear-to-t from-background to-transparent to-40%" />
    </div>
  );
}

// Frames every game's page the same way regardless of what's below it (a
// hero-stat panel, a build picker, or just a bare list) - names what changed
// and points at the full history, so the patch-note content underneath
// never has to explain itself.
function GameIntro({ gameName, lastPlayedAt }: { gameName: string; lastPlayedAt: Date | null }) {
  return (
    <div className="mb-6 max-w-2xl">
      <span className="mb-2 block font-mono text-xs uppercase tracking-wide text-brand">
        // whats changed
      </span>
      <p className="text-sm text-muted-foreground">
        {lastPlayedAt ? (
          <>
            Since you last played {gameName}{" "}
            <span className="font-medium text-brand">{sincePhrase(lastPlayedAt)}</span>, here&apos;s what&apos;s
            changed.
          </>
        ) : (
          `Here's what's changed in ${gameName} recently.`
        )}{" "}
        You can also view the full patch note history below.
      </p>
    </div>
  );
}

export async function SelectedGamePanel({
  game,
  lastPlayedAt,
  steamId,
  heroParam,
}: {
  game: ActiveGameInfo;
  lastPlayedAt: Date | null;
  steamId: string;
  heroParam?: string;
}) {
  const sinceDate = (
    lastPlayedAt ?? new Date(Date.now() - FALLBACK_SINCE_DAYS * 24 * 60 * 60 * 1000)
  ).toISOString();

  // Generic (non-curated) games have no adapter, no builds, no persona -
  // just the free, universal patch-notes tier.
  if (game.kind === "generic") {
    const patchNotes = await getGenericPatchNotesWithCache(game.appId, sinceDate);
    const hasHighlights = getPatchHighlights(patchNotes).length > 0;

    return (
      <>
        <GameBanner imageUrl={getSteamHeaderUrlForAppId(game.appId)} artPosition="" />
        <GameIntro gameName={game.name} lastPlayedAt={lastPlayedAt} />
        <ReinstallRecapTeaser gameName={game.name} />
        {hasHighlights ? (
          <PatchHighlights gameName={game.name} entries={patchNotes} />
        ) : (
          <PatchNotesList gameName={game.name} entries={patchNotes} />
        )}
      </>
    );
  }

  const { config } = game;

  const [builds, patchNotes] = await Promise.all([
    getBuildsWithCache(ADAPTERS[config.id]),
    getPatchNotesWithCache(ADAPTERS[config.id], sinceDate),
  ]);

  const banner = <GameBanner imageUrl={getSteamHeaderUrl(config.id)} artPosition={getSteamHeaderArtPosition(config.id)} />;
  const intro = <GameIntro gameName={config.name} lastPlayedAt={lastPlayedAt} />;

  const persona = config.id === "dota2" && (
    <Dota2Persona steamId={steamId} heroParam={heroParam} patchNotes={patchNotes} />
  );

  if (builds.length > 0) {
    return (
      <>
        {banner}
        {persona}
        {intro}
        <ReinstallRecapTeaser gameName={config.name} />
        <PatchHighlights gameName={config.name} entries={patchNotes} />
        <span className="mb-4 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
          // recommended builds — {config.name.toLowerCase()}
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
      {banner}
      {persona}
      {intro}
      <ReinstallRecapTeaser gameName={config.name} />
      {hasHighlights ? (
        <PatchHighlights gameName={config.name} entries={patchNotes} />
      ) : (
        <PatchNotesList gameName={config.name} entries={patchNotes} />
      )}
    </>
  );
}
