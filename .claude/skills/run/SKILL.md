---
name: run
description: Launch and drive the Comeback Next.js app locally for real (dev server, a real Better Auth session without needing a real Steam login, the actual per-game routes, and the slow/fragile paths worth checking before calling something done).
---

# Running Comeback

Next.js 16 (Turbopack) app. `npm run dev` serves on `http://localhost:3000`
(falls back to 3001 if something already owns 3000 — check `curl -sf
localhost:3000` first, and note Next.js dev refuses a second instance
against the same project dir even on a different port, so don't run two
at once).

```bash
npm run dev &
timeout 30 bash -c 'until curl -sf http://localhost:3000 >/dev/null; do sleep 1; done'
```

Stop with the port kill, not `pkill -f`: `lsof -ti:3000 -sTCP:LISTEN | xargs -r kill` (POSIX) or on
Windows, find the PID via the "Port 3000 is in use by process N" message
Next prints, then `taskkill /PID N /F`.

## Auth: no real Steam login needed (updated 2026-08-13, Better Auth migration)

Auth is Better Auth now (`src/lib/auth/server.ts`), not the old hand-rolled
JWT (`src/lib/steam/session.ts` - deleted). Sign-in entry point is
`/sign-up`, not `/api/auth/steam/login` directly - it lists every way to
start (Steam, email magic-link) as peer options.

For a real session without a real Steam login, POST directly to the
custom bridge endpoint (`src/lib/auth/steamPlugin.ts`) - it finds-or-creates
the Better Auth user for a given steamId and sets a real session cookie.
Far simpler than the old JWT-signing dance - no secret-reading, no HMAC:

```js
const { chromium } = require("playwright");
const browser = await chromium.launch();
const context = await browser.newContext();
await context.request.post("http://localhost:3000/api/auth/sign-in/steam", {
  data: { steamId: "76561198073341876", personaName: "TestPersona" },
});
// context now holds a real better-auth.session_token cookie - just navigate normally:
const page = await context.newPage();
await page.goto("http://localhost:3000/dashboard");
```

`76561198073341876` is the real test account used throughout this
project's history (has genuine playtime across the curated games — see
memory `project-status`). Calling `context.request.post(...)` (not a bare
`fetch`) is what makes this work with zero extra plumbing - Playwright's
request context shares its cookie jar with every `page` created from the
same `context` automatically.

For the email path, `authClient.signIn.magicLink({ email, callbackURL })`
from `/sign-up`'s form works the same live in dev as prod (real Resend
send) - the link lands at `/api/auth/magic-link/verify?token=...`, which
sets the session cookie the same way.

## Playwright

No `chromium-cli` on this machine as of 2026-08. Playwright itself isn't
a project dependency (only `jose`/`mongodb`/etc are) — install it into
your scratchpad dir, not the repo:

```bash
cd <scratchpad> && npm init -y && npm install playwright@1.57
npx playwright install chromium   # the ms-playwright cache on this machine can be a version behind what a fresh `npm install playwright` expects — install explicitly rather than assuming the cache matches
```

Then drive it as a normal Node script (`require("playwright")`), not
`chromium-cli` — write the script, run with `node`, screenshot to a file,
`Read` the PNG back.

## Real routes to check

- `/` — homepage (marketing, no auth)
- `/dashboard` — the "your library" browse grid (all owned games)
- `/dashboard/poe`, `/dashboard/dota2`, `/dashboard/cs2` — the three
  curated "deep dive" games. **Not** a `?game=` query param — that was
  the architecture before commit `42eb1c1` reworked it into real
  per-game routes; if you see stale guidance pointing at `?game=`,
  ignore it.
- `/dashboard/<steamAppId>` — any other owned game, generic patch-notes-only
  tier (e.g. Wallpaper Engine, appid 431960, or grab any non-curated
  `href` off the `/dashboard` grid rather than guessing an appid)

## Known slow/fragile paths — set generous timeouts, don't assume a stall means broken

- **This project is on Next.js 16, which renamed `middleware.ts` →
  `proxy.ts` (exported function `middleware` → `proxy`).** A leftover
  `middleware.ts` is silently dead code - no build error, no warning,
  it just never runs, and every request behaves as if there were no
  gate at all. Cost real time to diagnose once already (an unconditional
  redirect placed in a wrongly-named file produced zero effect and zero
  error output). The real file is `src/proxy.ts` (**not** the repo
  root - this project uses a `src/` dir, and `proxy.ts` has to sit at
  the same level as `src/app`, unlike the old root-level
  `middleware.ts` convention). If you're ever debugging "auth gate
  doesn't seem to fire" and don't immediately find `src/proxy.ts`
  exporting `proxy`, that's almost certainly the whole problem. **If
  `proxy.ts`/`middleware.ts` ever moves or gets renamed while the dev
  server is running, a plain restart isn't enough** - Turbopack caches
  the old path in `.next` and throws `Could not parse module
  '[project]/proxy.ts', file not found` on every matched request until
  you `rm -rf .next` and restart clean. Cost real time twice in one
  session before that pattern was clear - if a route that should be
  gated starts 500ing (not just failing to redirect) right after moving
  where the proxy file lives, clear `.next` first before debugging
  further.
- **A flat ~20s server-side delay on `/dashboard*` requests showed up
  earlier in this project's history**, isolated to a freshly-started
  dev server's first outbound fetch (confirmed via direct `curl`/bare
  `node fetch()` both being fast independently) - but it cleared up on
  its own within the same dev server process after enough requests had
  gone through, and hasn't reproduced since. If a cold `/dashboard` load
  looks slow again, give it a 60s Playwright nav timeout before assuming
  it's broken, but don't assume it's still an open bug either.
- **PoE build recommendations are currently broken** (poe.ninja changed
  their protobuf schema, `fetchRecommendedBuilds` returns `[]`) — the
  PoE game page will legitimately show patch notes only, no build
  picker. That's expected right now, not a new regression to report.

## One representative pass

```
nav /                          -> screenshot, check hero terminal panel renders
nav /dashboard                 -> screenshot, check grid populates
nav /dashboard/poe              -> screenshot (60s timeout), check patch highlights render
console errors                 -> should be empty; a red overlay screenshot means a server exception, read the stack in the image itself
```