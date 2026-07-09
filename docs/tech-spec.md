# "Welcome Back" Game Briefing Tool — Technical Spec (v0.1)

## 1. Concept Summary

A web app that connects to a user's Steam account, identifies games they haven't
played in a while, and generates a personalized AI briefing covering:

1. **What's changed** since they last played (systems, mechanics, content, balance)
2. **What's popular/fun right now** — recommended characters/classes/killers/builds
   to jump back in with, based on current meta and community sentiment

The goal is to solve the specific moment of friction where a lapsed player wants to
return to a live-service game but doesn't know where to start, and bounces off
instead of reinstalling.

This is not a companion app for active players (that market is saturated — see
competitor notes below). It is specifically for the "I haven't played in months/years,
should I jump back in and how" moment.

## 2. Launch Scope: 3 Games

| Game | Genre | Why it fits |
|---|---|---|
| Dead by Daylight | Asymmetric horror | Frequent balance patches, strong meta shifts, personal test case |
| Destiny 2 | Looter-shooter | Seasonal resets, well-known "returning player" pain point in community |
| Path of Exile (1 or 2) | ARPG | Leagues reset ~every 3 months, arguably the single best-fit game for this idea |

Each game will need its own ingestion adapter (see Section 4) since patch note
formats and meta-data sources differ per title. Do not try to generalize to
"any Steam game" for v1 — that's a v2+ problem once the pipeline is proven.

## 3. User Flow (MVP)

1. User lands on site, clicks "Connect Steam" (Steam OpenID login — no user-side
   API key needed).
2. App pulls their owned games via Steam Web API, filters to the 3 supported titles.
3. For each supported game they own, show total playtime and (if available)
   approximate last-played info.
4. **Manual confirmation step**: user picks/confirms roughly when they stopped
   playing (see Section 5 — Steam's data alone isn't reliable enough for this).
5. User selects a game → app generates:
   - **Changed Since You Left** briefing (patch/content synthesis)
   - **Jump Back In** recommendations (popular/fun characters, builds, activities)
6. Output shown as a single readable page, not a raw changelog dump.

## 4. Data Pipeline

### 4.1 Steam Data
- `GetOwnedGames` (Steam Web API) — playtime, appid list
- `GetRecentlyPlayedGames` — playtime in last 2 weeks (useful signal, not sufficient alone)
- Requires one server-side Steam Web API key (developer-owned), user auth via
  Steam OpenID (no key exposure to end users)

### 4.2 Patch Notes / Content History (per game, separate adapters)
- **Dead by Daylight**: Behaviour Interactive's official patch notes / Steam news feed
- **Destiny 2**: Bungie.net API and/or official patch note pages (Bungie has a
  public API — worth checking scope/rate limits before building)
- **Path of Exile**: GGG's official patch notes / league announcement pages

Each adapter's job: pull structured (or semi-structured) patch entries with dates,
normalize into a common internal schema:

```
{
  game_id,
  patch_date,
  raw_title,
  raw_body,
  tags: [balance, content, systems, bugfix] // best-effort classification
}
```

### 4.3 Meta / Popularity Data (for recommendations)
This is a new data need beyond the original patch-digest idea. See Section 4.4
below for the resolved research on best sources per game — data quality varies
significantly by title (PoE has real ladder data via poe.ninja; DBD has no
equivalent and relies on opinion-based tier lists).

## 4.4 Meta/Build Data Sources (resolved)

Research pass completed — here's the actual best source per game, replacing the
open question from the earlier draft:

| Game | Best source | Access method | Data quality |
|---|---|---|---|
| **Path of Exile** | **poe.ninja** | Public API/JSON endpoints, well-established, widely used by the community already | Strongest option — real ladder data (actual build popularity from real characters), not opinion |
| **Destiny 2** | **Bungie's official API** (stats/activity data) + **light.gg** (weapon/perk popularity, trusted by 40M+ players) | Bungie API is public and documented; light.gg has no public API found — would need scraping or manual reference | Good — official API gives legitimate player data; popularity layer is semi-manual |
| **Dead by Daylight** | No equivalent exists | Entirely blog/tier-list sites (PCGamesN, propelrc, Otzdarva's community tierlists) | Weakest — opinion-based rankings only, no real usage data, no API |

**Practical implication per game:**

- **PoE** — build this one first/best. Real data means genuinely trustworthy
  recommendations, and it's the closest fit to the original "here's what's
  actually strong right now" pitch.
- **Destiny 2** — workable. Combine Bungie API stats with periodic manual
  reference to community popularity sources for the "what's fun/popular" layer.
- **DBD** — the weak link, and worth being upfront about internally and possibly
  in-product. Realistic approach: have the AI synthesize a recommendation from
  current patch notes plus a small set of trusted tier-list sources treated as
  reference text (not structured scraped data), rather than presenting it with
  the same confidence as PoE's data-backed picks. Consider labeling DBD
  recommendations differently in the UI (e.g. "community consensus" vs PoE's
  "ladder data") so the product isn't overstating its own certainty.

This difference in data quality across the 3 launch games is a reasonable
argument for building PoE's pipeline first as the proof of concept, then
Destiny 2, then DBD last — inverse of the original "DBD first since you can
self-test" suggestion. Worth weighing both factors (data quality vs. personal
testability) when deciding actual build order.

## 5. Known Hard Problems (flag early, don't underestimate)

1. **"Last played" precision** — Steam does not expose a clean historical
   last-played timestamp beyond "played in last 2 weeks." Plan: ask the user to
   confirm/select a rough date rather than relying on Steam data alone.
2. **Patch note format inconsistency** — each game's notes are structured
   differently (see earlier research: even within one game's own wiki style guide,
   formatting conventions are strict and particular). Budget real time for each
   adapter, don't assume a shared parser will work across games.
3. **Meta/build data source reliability** — resolved via research (Section 4.4).
   Quality varies significantly by game: PoE has real ladder data, DBD does not.
   Design the product to be honest about this difference rather than presenting
   all 3 games' recommendations with equal confidence.
4. **Synthesis quality** — the AI step needs per-game prompt tuning (DBD's meta
   language ≠ Destiny's ≠ PoE's). Generic "summarize this" prompting will produce
   mediocre output; expect iteration here.

## 6. Tech Stack

- **Frontend**: Next.js + React + Tailwind. App Router works well here — server
  components for the mostly-static briefing content, client components for the
  interactive build picker (Section 6b).
- **Backend**: Next.js API routes / route handlers — no need for a separate
  backend service at MVP scale. Steam API calls, patch note ingestion jobs, and
  AI synthesis calls can all live here.
- **Database**: MongoDB. Good fit for this data actually — patch notes and build
  data are semi-structured and vary per game, so a flexible schema beats forcing
  everything into rigid relational tables. Suggested collections:
  - `users` — Steam ID, linked profile info
  - `game_snapshots` — per-user, per-game ownership/playtime pulls, refreshed on visit
  - `patch_notes` — per-game, normalized entries with date + tags (Section 4.2 schema)
  - `builds` — per-game, per-character/killer, current recommended builds + metadata
  - `briefings` — cached generated output per user/game/date-range, so repeat
    visits don't regenerate the same synthesis
- **AI**: Claude API for the synthesis step (both "what changed" and
  "what's popular" generation)
- **Animation**: Framer Motion for the build-picker transitions (tab switching,
  card entrance) — given your experience here, this is a good place to make the
  product feel more polished than a typical indie tool without much extra effort.
- **ThreeJS**: no clear need for this at MVP scope — flagging so it doesn't
  quietly creep into scope. Worth revisiting only if a future version wants a
  visual "build tree" or 3D loadout view, which is a nice-to-have, not core.

## 6b. Interactive Build Recommendations (UI)

Rather than a text list of "popular builds," present recommendations as an
interactive picker:

- Tab/selector row for characters/killers/classes (per game)
- Selecting one shows their recommended build as a card grid (perks/abilities/
  items), each with a short label — not paragraphs
- A short "why this works now" line ties the build back to what changed, linking
  the two features (briefing + recommendations) together instead of keeping them
  separate
- Framer Motion handles the transition between selections (fade/slide on tab
  switch, staggered card entrance) — low effort given existing experience, high
  perceived-polish payoff

This pattern is reusable across all 3 launch games with the same component,
just swapping data: killers/perks (DBD), subclasses/loadouts (Destiny 2),
ascendancies/builds (PoE). The component logic is shared; only the `builds`
data per game differs.

Data note: recommendation quality varies by game — see Section 4.4. Design the
UI to reflect this honestly (e.g. a "data-backed" indicator for PoE vs.
"community consensus" for DBD) rather than presenting all games identically.

## 7. MVP Definition of Done

- Steam login works
- User can select from DBD / Destiny 2 / PoE (only games they own, and only if
  they've played before)
- User confirms approximate last-played date
- App generates and displays:
  - A synthesized "what's changed" briefing
  - A short "here's what to play / try" recommendation block
- Output is cached so repeat visits for the same game/date range don't regenerate

## 8. Explicitly Out of Scope for v1

- Any live in-game overlay
- Support for more than 3 games
- Account-wide "check all your games at once" scanning
- Social/sharing features
- Monetization/paywall logic

## 8b. Noted Future Feature (v2+): Mood/Time-Based Library Recommender

Idea surfaced during ongoing build (not v1 scope, but worth recording so it
isn't lost): a "what should I play tonight" picker that works across the
user's whole Steam library, not just the 3 supported titles.

- User inputs a rough mood and how much time they have to play.
- App recommends an owned game matching that input (using Steam genre/tag
  data and playtime history — exact data source TBD, likely Steam store API
  and/or SteamSpy rather than anything requiring new auth scope).
- A "Play" action launches the game directly via Steam's `steam://run/<appid>`
  protocol handler.
- **The tie-in that makes this worth doing**: if the recommended game is one
  of the 3 supported titles (DBD/Destiny 2/PoE) and the user hasn't played it
  recently, route them into the existing "what's changed" briefing flow
  before/instead of just launching the game — this turns the recommender into
  a funnel back into the app's core feature rather than a standalone dead end.

This directly overlaps with the "account-wide scanning" item explicitly
excluded above — that exclusion should be treated as a v1-only constraint,
not a permanent one. Don't build this before the 3-game MVP is validated
(see Section 9); the MVP's job is to prove the core briefing pipeline works
before expanding scope sideways into whole-library recommendations.

## 8c. Competitor / Prior Art Notes

Captured from a research pass discussing whether this idea is still viable —
kept here for future reference rather than re-researching from scratch later.

- **Patched.gg** — closest aesthetic inspiration. Game-news/patch-digest style
  site with a strong visual look driven by hotlinking official Steam CDN art
  per-appid (not custom/rehosted assets), with a footer attribution disclaimer.
  Doesn't do the "returning player" personalization angle — it's a general
  patch-notes aggregator, not tied to a specific user's play history.
- **League of Legends' official returning-player feature** — Riot has a built-in
  "welcome back" flow inside the client (highlights what's changed, offers
  catch-up rewards). Proves the underlying pain point is real and worth
  addressing, but it's single-game and first-party — not a cross-game or
  ownership-aware tool.
- **maxroll.gg** — high-quality build guides across several ARPGs/live-service
  games. Strong on build content, but it's manually curated editorial content,
  not personalized to what a specific user owns or hasn't played recently.
- **poe.ninja** — the actual data source this project plans to use for PoE
  (Section 4.4). It's a ladder/build-stats site, not a briefing or
  recommendation product — no synthesis, no personalization, no "what changed"
  narrative.
- **Path of Building** — build planning/simulation tool for PoE. Deep and
  trusted within that community, but it's a planning tool for players who
  already know what they want to build, not a "what should I do" discovery
  tool for lapsed players.
- **Official Destiny 2 Companion app** — Bungie's own app for checking
  inventory/vendors/stats. Useful for active players, but doesn't address the
  "I've been gone a while, what changed and what's good now" moment at all.

**Conclusion from that research pass**: no direct 1:1 competitor exists for
this specific combination — ownership-aware (via Steam login), cross-game,
personalized "what changed + what's popular now" briefing, with honest
data-quality signaling per game (Section 4.4). Closest adjacent tools each
cover one slice (aesthetic, single-game returning-player UX, build content,
raw data, or planning) but not the combination. This was the basis for judging
the idea still viable rather than redundant with existing tools.

## 9. Suggested Next Steps

1. Build the Steam auth + library pull first (fastest to prove out, no per-game work)
2. Build the Path of Exile adapter end-to-end first — poe.ninja's real ladder
   data makes this the strongest proof of concept, and the data pipeline is the
   most trustworthy of the three (see Section 4.4)
3. Validate with real users once PoE works end-to-end (Reddit gut-check, e.g.
   r/pathofexile) before investing in the other two adapters
4. Build Destiny 2 next (Bungie API + light.gg-style reference), then DBD last,
   being upfront in the UI about DBD's weaker data backing (community
   consensus rather than usage data)