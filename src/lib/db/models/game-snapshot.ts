import type { GameId } from "@/types";

// Collection: game_snapshots — per-user, per-game ownership/playtime pulls,
// refreshed on visit (spec section 6)
export interface GameSnapshotDoc {
  userId: string;
  gameId: GameId;
  totalPlaytimeMinutes: number;
  lastPlayedConfirmedDate: string | null; // Section 5: Steam data alone isn't reliable
  refreshedAt: string;
}
