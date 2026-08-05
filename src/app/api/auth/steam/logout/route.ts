import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/steam/session";

// POST, not GET - a GET here has a real side effect (clears the session),
// and Next.js's <Link> prefetches its target automatically whenever it's
// visible on the page, which was silently logging users out just from the
// "Sign out" link being rendered in the nav, before anyone actually clicked it.
export async function POST(request: Request) {
  // 303, not the default 307 - the browser must switch to GET for the
  // redirect target (a POST here would 405 against the homepage, which
  // only has a GET handler).
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.delete({ name: SESSION_COOKIE_NAME, path: "/" });
  return response;
}
