import { NextResponse } from "next/server";
import { verifySteamCallback } from "@/lib/steam/openid";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  signSession,
} from "@/lib/steam/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { steamId } = await verifySteamCallback(searchParams);

  const token = await signSession({ steamId });
  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
