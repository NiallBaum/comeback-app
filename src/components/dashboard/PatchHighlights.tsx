import { getPatchHighlights } from "@/lib/patchNotes";
import { PatchNotesList } from "@/components/dashboard/PatchNotesList";
import type { PatchEntry } from "@/types";

interface PatchHighlightsProps {
  gameName: string;
  entries: PatchEntry[];
}

export function PatchHighlights({ gameName, entries }: PatchHighlightsProps) {
  const highlights = getPatchHighlights(entries);

  if (highlights.length === 0) return null;

  return (
    <div className="mb-10">
      <span className="mb-3 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
        // what changed — {gameName.toLowerCase()}
      </span>
      <div className="flex flex-col gap-1 font-mono text-sm">
        {highlights.map((line, i) => (
          <div key={i} className="text-add before:content-['+_']">
            {line}
          </div>
        ))}
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">
          view all patch notes
        </summary>
        <div className="mt-4">
          <PatchNotesList gameName={gameName} entries={entries} />
        </div>
      </details>
    </div>
  );
}
