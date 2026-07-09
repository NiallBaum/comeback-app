import type { PatchEntry } from "@/types";

// Collection: patch_notes — per-game, normalized entries with date + tags
// (spec section 4.2 / 6)
export type PatchNoteDoc = PatchEntry;
