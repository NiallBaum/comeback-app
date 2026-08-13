import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";

// POST, not GET - a GET here has a real side effect (clears the session),
// and Next.js's <Link> prefetches its target automatically whenever it's
// visible on the page, which was silently logging users out just from the
// "Sign out" link being rendered in the nav, before anyone actually clicked it.
export async function POST(request: Request) {
  const signOutResponse = await auth.api.signOut({
    headers: await headers(),
    asResponse: true,
  });

  // 303, not the default 307 - the browser must switch to GET for the
  // redirect target (a POST here would 405 against the homepage, which
  // only has a GET handler).
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  for (const cookie of signOutResponse.headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}