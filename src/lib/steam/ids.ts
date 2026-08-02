export function steam64ToSteam32(steamId64: string): string {
  const steam32 = BigInt(steamId64) - BigInt(76561197960265728)

  return steam32.toString();
}