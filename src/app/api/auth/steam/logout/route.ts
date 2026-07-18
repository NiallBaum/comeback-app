import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/steam/session";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete({ name: SESSION_COOKIE_NAME, path: "/" });
  return response;
}
