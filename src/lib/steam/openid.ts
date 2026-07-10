// Steam OpenID login flow — no user-side API key needed (spec 3/4.1)

export function buildSteamLoginUrl(returnUrl: string): string {
  const realm = new URL(returnUrl).origin;
  const params = new URLSearchParams({
    "openid.ns" : "http://specs.openid.net/auth/2.0",
    "openid.mode" : "checkid_setup",
    "openid.return_to" : returnUrl,
    "openid.realm" : realm,
    "openid.identity" : "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id" : "http://specs.openid.net/auth/2.0/identifier_select",
  });

  return `https://steamcommunity.com/openid/login?${params.toString()}`
}

export async function verifySteamCallback(
  query: URLSearchParams,
): Promise<{ steamId: string }> {
  const params = new URLSearchParams(query);
  params.set("openid.mode", "check_authentication");

  const response = await fetch("https://steamcommunity.com/openid/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  })

  const body = await response.text();

  if (body.includes("is_valid:true")) {
    const claimedId = query.get("openid.claimed_id");
    const steamId = claimedId?.split("/").pop();

    if (!steamId) {
      throw new Error("No steam ID in response");
    }

    return { steamId }
  } else {
    throw new Error("Invalid")
  }
}
