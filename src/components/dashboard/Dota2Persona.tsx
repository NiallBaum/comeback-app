import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { detectMainHero } from "@/lib/adapters/dota2/mainHero";
import { getPlaystyleProfileWithCache } from "@/lib/cache/playstyle";
import { getHeroPatchHighlights } from "@/lib/adapters/dota2/heroPatches";
import { getHeroStats } from "@/lib/adapters/dota2";
import { PlaystyleProfileCard } from "./PlaystyleProfileCard";
import { HeroPicker } from "./HeroPicker";
import { FadeIn } from "./FadeIn";
import type { PatchEntry } from "@/types";

interface Dota2PersonaProps {
  steamId: string;
  heroParam?: string;
  patchNotes: PatchEntry[];
}

export async function Dota2Persona({ steamId, heroParam, patchNotes }: Dota2PersonaProps) {
  // A manually picked hero always wins over auto-detection - if the user's
  // told us who they play, we don't second-guess it with OpenDota's guess.
  let heroName = heroParam;

  if (!heroName) {
    try {
      heroName = await detectMainHero(steamId);
    } catch {
      // Can't detect (privacy toggle off, or OpenDota's never indexed this
      // account) - falls through to the picker state below, not an error page.
    }
  }

  let profile = null;
  let heroHighlights: string[] = [];

  if (heroName) {
    try {
      profile = await getPlaystyleProfileWithCache(steamId, heroName);
      heroHighlights = getHeroPatchHighlights(patchNotes, heroName);
    } catch {
      // Either auto-detected or manually picked, but genuinely no match data
      // for this specific hero on this account - profile stays null.
    }
  }

  const heroes = (await getHeroStats()).map((hero) => hero.localized_name).sort();

  if (profile && heroName) {
    return (
      <div className="mb-8">
        <FadeIn transitionKey={`profile-${heroName}`}>
          <PlaystyleProfileCard heroName={heroName} profile={profile} />
          <div className="mt-3 space-y-3 border-t border-border pt-3">
            {heroHighlights.length > 0 && (
              <div>
                <span className="mb-2 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
                  // what changed for {heroName.toLowerCase()}
                </span>
                <ul className="space-y-1 font-mono text-sm text-add">
                  {heroHighlights.map((text) => (
                    <li key={text}>+ {text}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <span className="mb-2 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
                // switch hero
              </span>
              <HeroPicker gameId="dota2" heroes={heroes} selectedHero={heroName} />
            </div>
          </div>
        </FadeIn>
      </div>
    );
  }

  // Fallback state: either detection failed outright, or a resolved hero
  // (auto or manual) had no real match data. Same card shape either way, so
  // switching between "no hero yet" and "this hero has no data" only ever
  // changes the message, never the layout.

  return (
    <div className="mb-8">
      <FadeIn transitionKey={heroName ? `no-data-${heroName}` : "no-hero"}>
        <Card className="rounded-none [clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]">
          <CardHeader>
            <CardTitle>Playstyle profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {heroName
                ? `No match data found for ${heroName} on this account — try a different hero.`
                : `Can't detect your main hero yet — make sure "Expose Public Match Data" is enabled in Dota 2's client settings, or pick a hero below to preview their stats and patch notes anyway.`}
            </p>
            <HeroPicker gameId="dota2" heroes={heroes} selectedHero={heroName} />
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
