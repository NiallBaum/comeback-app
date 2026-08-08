const CLIP_PATH = "[clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]";

// Mirrors SelectedGamePanel's real shape (banner / intro / recap teaser /
// patch highlights / build picker) so nothing jumps or resizes once the
// real content lands - see the ~20s dashboard load time flagged in the
// UX audit (2026-08-08) for why this exists.
export default function GameLoading() {
  return (
    <main className="max-w-[900px] w-full mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <span className="skeleton h-3 w-24" />
        <div className="ml-auto flex gap-2">
          <span className="skeleton h-6 w-26" />
          <span className="skeleton h-6 w-16" />
          <span className="skeleton h-6 w-28" />
        </div>
      </div>

      <div className="skeleton mb-6 aspect-16/6 w-full rounded-t-lg" />

      <div className="mb-6 max-w-2xl space-y-2">
        <span className="skeleton block h-4 w-full" />
        <span className="skeleton block h-4 w-2/3" />
      </div>

      <div className={`mb-6 flex items-start gap-3 border border-dashed border-border bg-muted/40 px-5 py-5 ${CLIP_PATH}`}>
        <span className="skeleton mt-0.5 size-4 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <span className="skeleton block h-3 w-48" />
          <span className="skeleton block h-3 w-full" />
          <span className="skeleton block h-3 w-4/5" />
        </div>
      </div>

      <div className="mb-10">
        <span className="skeleton mb-3 block h-3 w-28" />
        <div className="space-y-2">
          <span className="skeleton block h-4 w-full" />
          <span className="skeleton block h-4 w-11/12" />
          <span className="skeleton block h-4 w-3/4" />
        </div>
      </div>

      <div>
        <div className="mb-3 flex gap-2">
          <span className="skeleton h-7 w-24" />
          <span className="skeleton h-7 w-20" />
          <span className="skeleton h-7 w-24" />
        </div>
        <div className={`border border-border bg-card p-5 ${CLIP_PATH}`}>
          <div className="mb-4 flex items-center gap-3">
            <div className="space-y-1.5">
              <span className="skeleton block h-3 w-20" />
              <span className="skeleton block h-4 w-32" />
            </div>
            <span className="skeleton ml-auto h-4 w-20" />
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="skeleton size-8" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}