import { NextResponse } from "next/server";
import { SUPPORTED_GAMES } from "@/lib/games";

// Returns the caller's owned games filtered to the 3 supported titles,
// with playtime/last-played info (spec section 3, steps 2-3).
export async function GET() {
  return NextResponse.json({ supportedGames: SUPPORTED_GAMES });
}
