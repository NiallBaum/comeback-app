import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { parsePatchBody } from "@/lib/patchNotes";
import type { PatchEntry } from "@/types";

interface PatchNotesListProps {
  gameName: string;
  entries: PatchEntry[];
}

const MAX_ENTRIES = 5;
const CLIP_PATH = "[clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]";

export function PatchNotesList({ gameName, entries }: PatchNotesListProps) {
  if (entries.length === 0) {
    return (
      <Card className={`rounded-none ${CLIP_PATH}`}>
        <CardContent className="py-10 text-center text-muted-foreground">
          No recent patch notes for {gameName}.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.slice(0, MAX_ENTRIES).map((entry, index) => (
        <Card key={`${entry.patchDate}-${index}`} className={`rounded-none ${CLIP_PATH}`}>
          <CardHeader>
            <div className="flex items-baseline justify-between gap-3">
              <CardTitle>{entry.rawTitle}</CardTitle>
              <span className="whitespace-nowrap font-mono text-xs uppercase tracking-wide text-muted-foreground">
                {entry.patchDate}
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            {parsePatchBody(entry.rawBody).map((block, i) => {
              if (block.type === "header") {
                return (
                  <p
                    key={i}
                    className="mt-2 font-mono text-xs font-semibold uppercase tracking-wide text-foreground first:mt-0"
                  >
                    {block.text}
                  </p>
                );
              }
              if (block.type === "bullet") {
                return (
                  <p key={i} className="pl-4 -indent-4 text-muted-foreground">
                    • {block.text}
                  </p>
                );
              }
              return (
                <p key={i} className="text-muted-foreground">
                  {block.text}
                </p>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
