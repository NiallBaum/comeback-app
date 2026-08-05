import { getMongoClient } from "../db/mongodb";
import type { PatchEntry } from "@/types";
import type { GameAdapter } from "../adapters/types";
import { fetchGenericPatchNotes } from "../adapters/genericSteamNews";

interface PatchNotesCacheDoc {
  // Plain string, not GameId — generic library games are cached keyed by
  // their raw Steam app id (as a string), not just the 3 curated ids.
  gameId: string;
  entries: PatchEntry[];
  fetchedAt: Date;
}

const ONE_HOUR_MS = 60 * 60 * 1000
const CACHE_WINDOW_DAYS = 365;

export async function getCachedPatchNotes(gameId: string, maxAgeMs: number): Promise<{ entries: PatchEntry[]; stale: boolean } | null> {
  const client = await getMongoClient();
  const doc = await client.db().collection<PatchNotesCacheDoc>("patchNotesCache").findOne({ gameId })

  if (!doc) return null

  const age = Date.now() - doc.fetchedAt.getTime()
  return { entries: doc.entries, stale: age > maxAgeMs }
}

export async function savePatchNotes(gameId: string, entries: PatchEntry[]): Promise<void> {
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

// Same lazy-fetch-and-cache shape as getPatchNotesWithCache, for any owned
// game outside the 3 curated adapters — keyed by the raw Steam app id
// instead of going through a full GameAdapter (a generic game has no build
// recs, so a whole adapter object would be overkill).
export async function getGenericPatchNotesWithCache(appId: number, sinceDate: string): Promise<PatchEntry[]> {
  const cacheKey = String(appId);
  const cached = await getCachedPatchNotes(cacheKey, ONE_HOUR_MS);

  let entries: PatchEntry[];

  if (cached && !cached.stale) {
    entries = cached.entries;
  } else {
    const windowStart = new Date(Date.now() - CACHE_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

    try {
      entries = await fetchGenericPatchNotes(appId, windowStart);
      await savePatchNotes(cacheKey, entries);
    } catch (err) {
      if (!cached) throw err;
      entries = cached.entries;
    }
  }

  return entries.filter((entry) => entry.patchDate >= sinceDate.slice(0, 10));
}
