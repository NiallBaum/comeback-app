import { getMongoClient } from "../db/mongodb";
import { getLastPlayedAt } from "../adapters/dota2/lastPlayed";

interface LastPlayedCacheDoc {
  steamId64: string;
  lastPlayedAt: Date | null;
  fetchedAt: Date;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

export async function getCachedLastPlayedAt(steamId64: string, maxAgeMs: number): Promise<{ lastPlayedAt: Date | null; stale: boolean } | null> {
  const client = await getMongoClient();
  const doc = await client.db().collection<LastPlayedCacheDoc>("lastPlayedCache").findOne({ steamId64 });

  if (!doc) return null;

  const age = Date.now() - doc.fetchedAt.getTime();
  return { lastPlayedAt: doc.lastPlayedAt, stale: age > maxAgeMs };
}

export async function saveLastPlayedAt(steamId64: string, lastPlayedAt: Date | null): Promise<void> {
  const client = await getMongoClient();
  await client.db().collection<LastPlayedCacheDoc>("lastPlayedCache").updateOne(
    { steamId64 },
    { $set: { lastPlayedAt, fetchedAt: new Date() } },
    { upsert: true }
  );
}

export async function getLastPlayedAtWithCache(steamId64: string): Promise<Date | null> {
  const cached = await getCachedLastPlayedAt(steamId64, ONE_HOUR_MS);

  if (cached && !cached.stale) {
    return cached.lastPlayedAt;
  }

  try {
    const lastPlayedAt = await getLastPlayedAt(steamId64);
    await saveLastPlayedAt(steamId64, lastPlayedAt);
    return lastPlayedAt;
  } catch (err) {
    if (cached) return cached.lastPlayedAt;
    throw err;
  }
}
