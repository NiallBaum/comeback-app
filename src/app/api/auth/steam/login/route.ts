import { NextResponse } from "next/server";
import { buildSteamLoginUrl } from "@/lib/steam/openid";

export async function GET(request: Request) {
  const returnUrl = new URL("/api/auth/steam/callback", request.url).toString();
  return NextResponse.redirect(buildSteamLoginUrl(returnUrl));
}
