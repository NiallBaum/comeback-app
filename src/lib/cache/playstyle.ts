import { getMongoClient } from "../db/mongodb";
import { getPlaystyleProfile } from "../adapters/dota2/playstyle";
import type { PlaystyleProfile } from "../adapters/dota2/playstyle";

interface PlaystyleCacheDoc {
  steamId64: string;
  heroName: string;
  profile: PlaystyleProfile;
  fetchedAt: Date;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

export async function getCachedPlaystyleProfile(steamId64: string, heroName: string, maxAgeMs: number): Promise<{ profile: PlaystyleProfile; stale: boolean } | null> {
  const client = await getMongoClient();
  const doc = await client.db().collection<PlaystyleCacheDoc>("playstyleCache").findOne({ steamId64, heroName });

  if (!doc) return null;

  const age = Date.now() - doc.fetchedAt.getTime();
  return { profile: doc.profile, stale: age > maxAgeMs };
}

export async function savePlaystyleProfile(steamId64: string, heroName: string, profile: PlaystyleProfile): Promise<void> {
  const client = await getMongoClient();
  await client.db().collection<PlaystyleCacheDoc>("playstyleCache").updateOne(
    { steamId64, heroName },
    { $set: { profile, fetchedAt: new Date() } },
    { upsert: true }
  );
}

export async function getPlaystyleProfileWithCache(steamId64: string, heroName: string): Promise<PlaystyleProfile> {
  const cached = await getCachedPlaystyleProfile(steamId64, heroName, ONE_HOUR_MS);

  if (cached && !cached.stale) {
    return cached.profile;
  }

  try {
    const profile = await getPlaystyleProfile(steamId64, heroName);
    await savePlaystyleProfile(steamId64, heroName, profile);
    return profile;
  } catch (err) {
    if (cached) return cached.profile;
    throw err;
  }
}
