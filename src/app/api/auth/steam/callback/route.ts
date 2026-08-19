import { NextResponse } from "next/server";
import { verifySteamCallback } from "@/lib/steam/openid";
import { getPlayerSummary } from "@/lib/steam/client";
import { auth } from "@/lib/auth/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { steamId } = await verifySteamCallback(searchParams);

  // Best-effort - a Steam API hiccup should never block a real,
  // already-verified login. steamSessionPlugin still creates/finds the
  // account fine without a persona name or avatar.
  let personaName: string | undefined;
  let avatarUrl: string | undefined;
  try {
    const profile = await getPlayerSummary(steamId);
    personaName = profile?.personaName;
    avatarUrl = profile?.avatarUrl;
  } catch (err) {
    console.error("Failed to fetch Steam profile on login:", err);
  }

  const sessionResponse = await auth.api.signInSteam({
    body: { steamId, personaName, avatarUrl },
    headers: request.headers,
    asResponse: true,
  });

  const { status } = await sessionResponse.json();

  if (status === "no-account") {
    return NextResponse.redirect(new URL("/sign-up?steam=required", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  for (const cookie of sessionResponse.headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}