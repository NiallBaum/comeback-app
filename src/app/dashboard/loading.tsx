const CLIP_PATH = "[clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]";

// Heading is real (it's static, not part of the async data), only the
// filter bar + grid - the parts that actually wait on resolveLibrary() -
// are skeletons. See ~20s dashboard load time in the UX audit (2026-08-08).
export default function DashboardLoading() {
  return (
    <main className="max-w-[1440px] w-full mx-auto px-4 py-8">
      <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
        // your library
      </span>
      <h1 className="mt-1 mb-8 text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="skeleton h-9 min-w-50 flex-1" />
        <span className="skeleton h-9 w-36" />
        <span className="skeleton h-9 w-24" />
        <span className="skeleton h-9 w-28" />
        <span className="skeleton ml-auto h-9 w-20" />
      </div>

      <span className="skeleton mb-3 block h-3 w-32" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`curated-${i}`} className={`skeleton col-span-2 row-span-2 aspect-16/10 ${CLIP_PATH}`} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`regular-${i}`} className={`skeleton aspect-2/3 ${CLIP_PATH}`} />
        ))}
      </div>
    </main>
  );
}