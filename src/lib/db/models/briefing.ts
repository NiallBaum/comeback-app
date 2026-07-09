import type { Briefing } from "@/types";

// Collection: briefings — cached generated output per user/game/date-range,
// so repeat visits don't regenerate the same synthesis (spec section 6/7)
export type BriefingDoc = Briefing;
