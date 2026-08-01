import type { BuildRecommendation } from "@/types";

// Dummy data for UI development. Replace with real per-game ingestion
// (poe.ninja, OpenDota — see docs/tech-spec.md section 4.4) once each
// adapter exists. CS2 has no build/loadout data source at all (by design,
// not a gap) — its mock entry below has empty `items` on purpose.

export const mockPoeBuilds: BuildRecommendation[] = [
  {
    gameId: "poe",
    characterOrClass: "Necromancer",
    label: "Minion Instability Necro",
    items: [
      { name: "Raise Spectre" },
      { name: "Bone Offering" },
      { name: "Fleshcrafter" },
      { name: "Convocation" },
    ],
    whyItWorksNow: "Minion buffs in the latest patch pushed clear speed to the top of the ladder.",
    confidence: "data-backed",
    leagueMode: "standard",
  },
  {
    gameId: "poe",
    characterOrClass: "Deadeye",
    label: "Tornado Shot Ranger",
    items: [
      { name: "Tornado Shot" },
      { name: "Vaal Rain of Arrows" },
      { name: "Ashes of the Stars" },
      { name: "Quiver: Chin Sol" },
    ],
    whyItWorksNow: "Cheap to gear and still one of the highest-population builds on poe.ninja this league.",
    confidence: "data-backed",
    leagueMode: "hardcore",
  },
];

export const mockDota2Builds: BuildRecommendation[] = [
  {
    gameId: "dota2",
    characterOrClass: "Faceless Void",
    label: "Battle Fury Carry",
    items: [
      { name: "Battle Fury" },
      { name: "Black King Bar" },
      { name: "Butterfly" },
      { name: "Chronosphere" },
    ],
    whyItWorksNow: "High win rate at this bracket per OpenDota's current patch stats.",
    confidence: "data-backed",
  },
  {
    gameId: "dota2",
    characterOrClass: "Invoker",
    label: "Quas-Wex Midlane",
    items: [
      { name: "Aghanim's Scepter" },
      { name: "Kaya and Sange" },
      { name: "Aether Lens" },
      { name: "Octarine Core" },
    ],
    whyItWorksNow: "Consistently high pick/win rate across recent pro and pub matches.",
    confidence: "data-backed",
  },
];

export const mockCs2Builds: BuildRecommendation[] = [
  {
    gameId: "cs2",
    characterOrClass: "Patch highlight",
    label: "Recent balance & economy pass",
    items: [],
    whyItWorksNow: "Armor pricing and mid-round buys shifted again in the latest update.",
    confidence: "data-backed",
  },
];

export const mockBuilds = mockPoeBuilds;
