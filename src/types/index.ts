// Shared domain types (spec section 4.2 + 6b)

export type GameId = "dbd" | "destiny2" | "poe";

export interface PatchEntry {
  gameId: GameId;
  patchDate: string; // ISO date
  rawTitle: string;
  rawBody: string;
  tags: Array<"balance" | "content" | "systems" | "bugfix">;
}

export interface Briefing {
  userId: string;
  gameId: GameId;
  lastPlayedDate: string; // ISO date, user-confirmed
  changedSinceYouLeft: string;
  recommendations: BuildRecommendation[];
  generatedAt: string;
}

export interface BuildItem {
  name: string;
  iconUrl?: string
}

export interface BuildRecommendation {
  gameId: GameId;
  characterOrClass: string;
  label: string;
  items: BuildItem[]; // perks/abilities/items
  whyItWorksNow: string;
  confidence: "data-backed" | "community-consensus";
  pobCode?: string; // raw base64 Path of Building export, when the source provides one
  leagueMode?: "current" | "standard" | "hardcore";
}
