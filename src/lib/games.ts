import type { GameId } from "@/types";

export interface GameConfig {
  id: GameId;
  name: string;
  steamAppId: number;
}

// Section 2: launch scope is fixed at these 3 titles — do not generalize to "any Steam game" for v1
export const SUPPORTED_GAMES: GameConfig[] = [
  { id: "dbd", name: "Dead by Daylight", steamAppId: 381210 },
  { id: "destiny2", name: "Destiny 2", steamAppId: 1085660 },
  { id: "poe", name: "Path of Exile", steamAppId: 238960 },
];
