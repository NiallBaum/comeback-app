import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

export async function POST(request: Request) {
  const sessionResponse = await auth.api.disconnectSteam({
    headers: request.headers,
    asResponse: true,
  });

  return new NextResponse(sessionResponse.body, {
    status: sessionResponse.status,
    headers: sessionResponse.headers,
  });
}
