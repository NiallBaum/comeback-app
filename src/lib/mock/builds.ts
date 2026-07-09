import type { BuildRecommendation } from "@/types";

// Dummy data for UI development. Replace with real per-game ingestion
// (poe.ninja, Bungie API, DBD tier-list synthesis — see docs/tech-spec.md
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

export const mockDestiny2Builds: BuildRecommendation[] = [
  {
    gameId: "destiny2",
    characterOrClass: "Warlock — Prismatic",
    label: "Song of Flame Support",
    items: [
      { name: "Starfire Protocol" },
      { name: "Song of Flame" },
      { name: "Well of Radiance" },
      { name: "Speaker's Sight" },
    ],
    whyItWorksNow: "Strong in this season's endgame activity per Bungie API activity stats.",
    confidence: "data-backed",
  },
  {
    gameId: "destiny2",
    characterOrClass: "Titan — Arc",
    label: "Thundercrash Burst",
    items: [
      { name: "Thundercrash" },
      { name: "Cuirass of the Falling Star" },
      { name: "Storm's Keep" },
      { name: "Ballistic Slam" },
    ],
    whyItWorksNow: "Consistently referenced in community popularity round-ups this season.",
    confidence: "community-consensus",
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
