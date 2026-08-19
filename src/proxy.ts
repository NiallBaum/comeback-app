import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic cookie-presence check only (no DB call) - Better Auth's own
// session expiry/sliding-refresh is handled internally by getSession, not
// hand-rolled here like the old JWT session was.
//
// Named `proxy`, not `middleware` - Next.js 16 renamed the convention
// (middleware.ts/export function middleware is now silently dead code,
// no error). See git history if a `middleware.ts` reappears here by
// mistake; it won't run.
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-up", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/briefing/:path*", "/api/games", "/api/briefings/:path*"],
};