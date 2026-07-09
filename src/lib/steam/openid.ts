// Steam OpenID login flow — no user-side API key needed (spec 3/4.1)

export function buildSteamLoginUrl(returnUrl: string): string {
  throw new Error("not implemented");
}

export async function verifySteamCallback(
  query: URLSearchParams,
): Promise<{ steamId: string }> {
  throw new Error("not implemented");
}
