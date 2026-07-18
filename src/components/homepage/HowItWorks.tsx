const STEPS = [
  {
    title: "Connect Steam",
    body: "Sign in and we read your owned games and playtime — no manual setup per game.",
  },
  {
    title: "We check what changed",
    body: "Patch notes, meta shifts, and build changes since you last logged off, summarized per game.",
  },
  {
    title: "Jump back in with a plan",
    body: "A ready-made build recommendation for each supported game, so the first session back isn't spent relearning everything.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border py-16">
      <span className="font-mono text-xs uppercase tracking-wide text-brand">
        How it works
      </span>
      <h2 className="mt-2 mb-10 text-2xl font-semibold tracking-tight text-balance">
        Three steps back into a game you dropped.
      </h2>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <div key={step.title} className="flex flex-col gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
