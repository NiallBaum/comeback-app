import { getMongoClient } from "./mongodb";
import type { SteamProfile } from "../steam/client";

export interface UserDoc {
  steamId: string;
  personaName?: string;
  avatarUrl?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export async function upsertUserFromSteamLogin(steamId: string, profile: SteamProfile | null): Promise<void> {
  const client = await getMongoClient();

  await client.db().collection<UserDoc>("users").updateOne(
    { steamId },
    {
      $set: {
        lastLoginAt: new Date(),
        ...(profile ? { personaName: profile.personaName, avatarUrl: profile.avatarUrl } : {}),
      },
      $setOnInsert: { steamId, createdAt: new Date() },
    },
    { upsert: true }
  )
}