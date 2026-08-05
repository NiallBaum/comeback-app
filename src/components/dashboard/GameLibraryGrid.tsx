"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutGrid, List as ListIcon } from "lucide-react";

const CLIP_PATH = "[clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]";

export interface LibraryEntry {
  key: string;
  name: string;
  imageUrl: string;
  // Used if imageUrl 404s (some app ids, e.g. beta/demo builds, have no
  // vertical grid art) - falls back to the landscape header art instead of
  // a broken image.
  fallbackImageUrl?: string;
  artPosition: string;
  lastPlayedAt: Date | null;
  curated: boolean;
  // false = a curated game Steam hasn't confirmed ownership of (existing
  // "preview" fallback) - generic games are always matched by definition,
  // since they only ever come from the real owned-games list.
  matched: boolean;
  href: string;
  isActive: boolean;
}

function sincePhrase(date: Date): string {
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000)));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

type SortOption = "recent" | "alpha";

function sortEntries(entries: LibraryEntry[], sort: SortOption): LibraryEntry[] {
  const copy = [...entries];
  if (sort === "alpha") {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    copy.sort((a, b) => (a.lastPlayedAt?.getTime() ?? 0) - (b.lastPlayedAt?.getTime() ?? 0) === 0
      ? 0
      : (b.lastPlayedAt?.getTime() ?? -Infinity) - (a.lastPlayedAt?.getTime() ?? -Infinity));
  }
  return copy;
}

export function GameLibraryGrid({ entries }: { entries: LibraryEntry[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");
  const [filter, setFilter] = useState<"all" | "curated">("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const q = query.trim().toLowerCase();
  const filtered = entries.filter((entry) => {
    if (filter === "curated" && !entry.curated) return false;
    if (q && !entry.name.toLowerCase().includes(q)) return false;
    return true;
  });

  // Curated games always lead, regardless of chosen sort - they're the
  // product's actual differentiator, worth staying visually unmissable
  // rather than getting lost among 20+ other owned games.
  const curated = sortEntries(filtered.filter((e) => e.curated), "alpha");
  const rest = sortEntries(filtered.filter((e) => !e.curated), sort);
  const visible = [...curated, ...rest];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your library…"
            className="w-full border border-border bg-card py-2 pl-8 pr-3 text-sm outline-none focus:border-brand"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="border border-border bg-card px-3 py-2 font-mono text-xs uppercase tracking-wide outline-none focus:border-brand"
        >
          <option value="recent">Recently played</option>
          <option value="alpha">Alphabetical</option>
        </select>
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={`border px-3 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${
              filter === "all" ? "border-brand/45 bg-brand/10 text-brand" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All games
          </button>
          <button
            onClick={() => setFilter("curated")}
            className={`border px-3 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${
              filter === "curated" ? "border-brand/45 bg-brand/10 text-brand" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Deep dive only
          </button>
        </div>
        <div className="ml-auto flex border border-border">
          <button
            onClick={() => setView("grid")}
            aria-pressed={view === "grid"}
            title="Grid view"
            className={`flex items-center p-2 transition-colors ${view === "grid" ? "bg-brand/10 text-brand" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            title="List view"
            className={`flex items-center border-l border-border p-2 transition-colors ${view === "list" ? "bg-brand/10 text-brand" : "text-muted-foreground hover:text-foreground"}`}
          >
            <ListIcon className="size-4" />
          </button>
        </div>
      </div>

      <p className="mb-3 font-mono text-xs text-muted-foreground">
        {visible.length} of {entries.length} games{q ? ` matching "${query}"` : ""}
      </p>

      {visible.length === 0 ? (
        <p className="border border-border py-10 text-center text-sm text-muted-foreground">
          No games match your search.
        </p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <AnimatePresence mode="popLayout">
            {visible.map((entry) => (
              <motion.div
                key={entry.key}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={entry.curated ? "col-span-2 row-span-2" : ""}
              >
                <Link href={entry.href} className="block h-full">
                  {/* Two-layer clip-path frame: a plain `border` doesn't render
                      cleanly along a notched corner (visible gap at the cut),
                      so the "border" is really the outer div's fill color
                      showing through a 1px inset - same trick already used
                      for the dashboard's active-card highlight. */}
                  <div
                    className={`h-full p-px transition-colors ${CLIP_PATH} ${
                      entry.isActive ? "bg-brand" : "bg-border hover:bg-muted-foreground/60"
                    }`}
                  >
                  <div className={`h-full overflow-hidden bg-card ${CLIP_PATH}`}>
                    <div className={`relative h-full ${entry.curated ? "aspect-16/10" : "aspect-2/3"}`}>
                      <img
                        src={entry.imageUrl}
                        alt=""
                        onError={(e) => {
                          if (entry.fallbackImageUrl) {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = entry.fallbackImageUrl;
                          }
                        }}
                        className={`size-full object-cover ${entry.artPosition} ${entry.matched ? "" : "opacity-60 grayscale"}`}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-background/95 via-transparent to-transparent" />
                      {entry.curated && (
                        <span className="absolute left-2 top-2 bg-brand px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-brand-foreground">
                          Deep dive
                        </span>
                      )}
                      {entry.isActive && (
                        <span className="absolute right-2 top-2 rounded-full bg-brand px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-brand-foreground">
                          {entry.matched ? "Viewing" : "Previewing"}
                        </span>
                      )}
                      <div className="absolute inset-x-2 bottom-2">
                        <p className="truncate text-sm font-semibold">{entry.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {entry.matched
                            ? entry.lastPlayedAt
                              ? `last played ${sincePhrase(entry.lastPlayedAt)}`
                              : ""
                            : "not linked — preview"}
                        </p>
                      </div>
                    </div>
                  </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border">
          <AnimatePresence mode="popLayout">
            {visible.map((entry) => (
              <motion.div
                key={entry.key}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Link
                  href={entry.href}
                  className={`flex items-center gap-3 px-3 py-2 transition-colors ${entry.isActive ? "bg-brand/10" : "hover:bg-muted/50"}`}
                >
                  <img
                    src={entry.imageUrl}
                    alt=""
                    onError={(e) => {
                      if (entry.fallbackImageUrl) {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = entry.fallbackImageUrl;
                      }
                    }}
                    className={`h-10 w-16 shrink-0 rounded-sm object-cover ${entry.artPosition} ${entry.matched ? "" : "opacity-60 grayscale"}`}
                  />
                  <span className="flex-1 truncate font-medium">{entry.name}</span>
                  {entry.curated && (
                    <span className="shrink-0 border border-brand/45 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-brand">
                      Deep dive
                    </span>
                  )}
                  {entry.matched ? (
                    entry.lastPlayedAt && (
                      <span className="shrink-0 text-sm text-muted-foreground">last played {sincePhrase(entry.lastPlayedAt)}</span>
                    )
                  ) : (
                    <span className="shrink-0 text-sm text-muted-foreground">not linked — preview</span>
                  )}
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
