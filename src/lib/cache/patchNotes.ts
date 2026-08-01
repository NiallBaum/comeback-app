import { getMongoClient } from "../db/mongodb";
import type { GameId, PatchEntry } from "@/types";
import type { GameAdapter } from "../adapters/types";

interface PatchNotesCacheDoc {
  gameId: GameId;
  entries: PatchEntry[];
  fetchedAt: Date;
}

const ONE_HOUR_MS = 60 * 60 * 1000
const CACHE_WINDOW_DAYS = 365;

export async function getCachedPatchNotes(gameId: GameId, maxAgeMs: number): Promise<{ entries: PatchEntry[]; stale: boolean } | null> {
  const client = await getMongoClient();
  const doc = await client.db().collection<PatchNotesCacheDoc>("patchNotesCache").findOne({ gameId })

  if (!doc) return null
  
  const age = Date.now() - doc.fetchedAt.getTime()
  return { entries: doc.entries, stale: age > maxAgeMs }
}

export async function savePatchNotes(gameId: GameId, entries: PatchEntry[]): Promise<void> {
  const client = await getMongoClient();
  await client.db().collection<PatchNotesCacheDoc>("patchNotesCache").updateOne({ gameId }, { $set: {entries, fetchedAt: new Date() } }, { upsert: true });
}

export async function getPatchNotesWithCache(adapter: GameAdapter, sinceDate: string): Promise<PatchEntry[]>{
  const cached = await getCachedPatchNotes(adapter.gameId, ONE_HOUR_MS);

  let entries: PatchEntry[];

  if (cached && !cached.stale) {
    entries = cached.entries;
  } else {
    const windowStart = new Date(Date.now() - CACHE_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

    try {
      entries = await adapter.fetchPatchNotes(windowStart);
      await savePatchNotes(adapter.gameId, entries)
    } catch (err) {
      if (!cached) throw err;
      entries = cached.entries;
    }
  }

  return entries.filter((entry) => entry.patchDate >= sinceDate.slice(0, 10));
}
