import { CtaButton } from "@/components/homepage/CtaButton";
import { SUPPORTED_GAMES } from "@/lib/games";
import { mockPoeBuilds, mockDota2Builds } from "@/lib/mock/builds";

const TRANSCRIPT = [
  { cmd: "$ comeback sync --steam", ok: `247 games, ${SUPPORTED_GAMES.length} supported`, delay: "0.05s" },
  { cmd: "$ comeback diff --since=214d", ok: "12 changes found", delay: "0.2s" },
  { cmd: "$ comeback recommend", ok: "1 build ready", delay: "0.35s" },
];

const DIFF_LINES = [mockPoeBuilds[0].whyItWorksNow, mockDota2Builds[0].whyItWorksNow];

function SampleBriefingPanel() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card [clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)] shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="font-mono text-xs text-muted-foreground">sample_briefing.log</span>
        <div className="flex gap-1.5">
          <span className="size-1.5 rounded-full bg-border" />
          <span className="size-1.5 rounded-full bg-border" />
          <span className="size-1.5 rounded-full bg-border" />
        </div>
      </div>
      <div className="px-5 py-4 font-mono text-sm">
        {TRANSCRIPT.map((row) => (
          <div
            key={row.cmd}
            className="animate-reveal flex gap-3 py-1 text-muted-foreground opacity-0"
            style={{ animationDelay: row.delay, animationFillMode: "forwards" }}
          >
            <span className="text-foreground">{row.cmd}</span>
            <span className="ml-auto whitespace-nowrap text-add">{row.ok}</span>
          </div>
        ))}
        <div className="my-3 h-px bg-border" />
        <div className="flex flex-col gap-1">
          {DIFF_LINES.map((line) => (
            <div key={line} className="text-add before:content-['+_']">
              {line}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-foreground before:size-1.5 before:rounded-full before:bg-add before:content-['']">
          ready to jump back in
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="grid grid-cols-1 items-start gap-10 py-16 md:grid-cols-2 md:gap-14">
      <div>
        <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-brand before:size-1.5 before:rounded-full before:bg-brand before:content-['']">
          214 days since your last session
        </span>
        <h1 className="mt-2 mb-4 text-4xl font-bold tracking-tight text-balance md:text-5xl">
          You left. The meta didn&rsquo;t.
        </h1>
        <p className="mb-8 max-w-[34ch] text-muted-foreground">
          Connect Steam and Comeback reads back everything that changed in the games you dropped &mdash; then hands you a build that already accounts for it.
        </p>
        <CtaButton href="/api/auth/steam/login">connect_steam</CtaButton>
      </div>
      <SampleBriefingPanel />
    </section>
  );
}
