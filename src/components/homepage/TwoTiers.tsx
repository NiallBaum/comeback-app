const CLIP_PATH = "[clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]";

const TIERS = [
  {
    tag: "free · every game you own",
    tagColor: "text-muted-foreground",
    heading: "What changed since you last played",
    body: "Connect Steam and every game in your library — all of it, not just the ones we go deep on below — gets a real changelog since you last logged in. No setup, no picking games.",
    bullets: ["Patch notes for your entire library", "Updates the moment you log back in", "Free. Forever."],
  },
  {
    tag: "deep dive · dota 2, league, valorant",
    tagColor: "text-brand",
    heading: "Stats and builds, built for you",
    body: "For these three, we go further — your main hero's live stats, meta builds sourced from real match data, and a plain-English recap of whether it's worth jumping back in.",
    bullets: ["Your hero's stats, not generic ones", "Meta builds, data-backed where we can", "AI reinstall recap — coming soon"],
  },
];

export function TwoTiers() {
  return (
    <section className="border-t border-border py-16">
      <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
        // how comeback works
      </span>
      <h2 className="mt-2 mb-10 max-w-[28ch] text-2xl font-bold tracking-tight text-balance md:text-3xl">
        Connect once. Your whole library&apos;s covered — three games get the deep end.
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {TIERS.map((tier) => (
          <div key={tier.heading} className={`border border-border bg-card p-6 ${CLIP_PATH}`}>
            <span className={`font-mono text-xs uppercase tracking-wide ${tier.tagColor}`}>{tier.tag}</span>
            <h3 className="mt-2 mb-3 text-xl font-bold tracking-tight">{tier.heading}</h3>
            <p className="mb-5 text-sm text-muted-foreground">{tier.body}</p>
            <ul className="flex flex-col gap-1.5 font-mono text-sm">
              {tier.bullets.map((bullet) => (
                <li key={bullet} className="text-add before:content-['+_']">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
