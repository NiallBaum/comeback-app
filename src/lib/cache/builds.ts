import { getMongoClient } from "../db/mongodb";
import type { GameId, BuildRecommendation } from "@/types"
import type { GameAdapter } from "../adapters/types";

interface BuildCacheDoc {
  gameId: GameId;
  builds: BuildRecommendation[];
  fetchedAt: Date;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

export async function getCachedBuilds(gameId: GameId, maxAgeMs: number): Promise<{ builds: BuildRecommendation[]; stale: boolean } | null> {
  const client = await getMongoClient();
  const doc = await client.db().collection<BuildCacheDoc>("buildCache").findOne({ gameId })

  if (!doc) return null

  const age = Date.now() - doc.fetchedAt.getTime()
  return { builds: doc.builds, stale: age > maxAgeMs }
}

export async function saveBuilds(gameId: GameId, builds: BuildRecommendation[]): Promise<void> {
  const client = await getMongoClient();
  await client.db().collection<BuildCacheDoc>("buildCache").updateOne({ gameId }, { $set: { builds, fetchedAt: new Date() } }, { upsert: true });
}

export async function getBuildsWithCache(adapter: GameAdapter): Promise<BuildRecommendation[]> {
  const cached = await getCachedBuilds(adapter.gameId, ONE_HOUR_MS);

  if (cached && !cached.stale) {
    return cached.builds
  }

  try {
    const builds = await adapter.fetchRecommendedBuilds();
    await saveBuilds(adapter.gameId, builds);
    return builds
  } catch (err) {
    if (cached) return cached.builds
    throw err
  }
}