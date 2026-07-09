import { NextResponse } from "next/server";
import type { GameId } from "@/types";

// POST generates (or returns cached) briefing for a game/date-range
// (spec section 3 step 5, section 6 `briefings` collection, section 7).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ game: string }> },
) {
  const { game } = await params;
  return NextResponse.json({ game: game as GameId }, { status: 501 });
}
