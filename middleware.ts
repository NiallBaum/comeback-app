import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  signSession,
  verifySession,
  REISSUE_THRESHOLD_SECONDS,
} from "@/lib/steam/session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.next();
  }

  const session = await verifySession(token);
  const response = NextResponse.next();

  
  if (session.status !== "valid") {
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // Sliding expiry: every request that carries a valid session resets
  // the clock, so only genuinely dormant users (the product's own
  // definition of "lapsed") ever see a forced relogin.

  const remainingSeconds = session.expiresAt - Math.floor(Date.now() / 1000)

  if (remainingSeconds < REISSUE_THRESHOLD_SECONDS) {
    const refreshed = await signSession({ steamId: session.steamId });
    response.cookies.set(SESSION_COOKIE_NAME, refreshed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
  }
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/briefing/:path*", "/api/games", "/api/briefings/:path*"],
};
