import type { BuildRecommendation } from "@/types";

// Dummy data for UI development. Replace with real per-game ingestion
// (poe.ninja, OpenDota, DBD tier-list synthesis — see docs/tech-spec.md
// section 4.4) once each adapter exists.

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

export const mockDbdBuilds: BuildRecommendation[] = [
  {
    gameId: "dbd",
    characterOrClass: "The Wesker",
    label: "Slowdown + Info Wesker",
    items: [
      {
        name: "Lethal Pursuer",
        iconUrl: "https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/6/61/IconPerks_lethalPursuer.png"
      },
      {
        name: "Pain Resonance",
        iconUrl: "https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/7/79/IconPerks_scourgeHookPainResonance.png"
      },
      {
        name: "Grim Embrace",
        iconUrl: "https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/1/1c/IconPerks_grimEmbrace.png"
      },
      {
        name: "Nowhere to Hide",
        iconUrl: "https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/2/29/IconPerks_nowhereToHide.png"
      },
    ],
    whyItWorksNow: "Frequently recommended in current community tier lists (no ladder data available for DBD).",
    confidence: "community-consensus",
  
  },
  {
    gameId: "dbd",
    characterOrClass: "Feng Min",
    label: "Gen-Rush Support Survivor",
    items: [
      {
        name: "Prove Thyself",
        iconUrl: "https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/0/0f/IconPerks_proveThyself.png"
      },
      {
        name: "Deja Vu",
        iconUrl: "https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/8/89/IconPerks_dejaVu.png"
      },
      {
        name: "Resilience",
        iconUrl: "https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/e/ee/IconPerks_resilience.png"
      },
      {
        name: "Windows of Opportunity",
        iconUrl: "https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/1/17/IconPerks_windowsOfOpportunity.png"
      }
    ],
    whyItWorksNow: "A common pick in recent community tier lists for consistent gen speed.",
    confidence: "community-consensus",
  },
];

export const mockBuilds = mockPoeBuilds;
