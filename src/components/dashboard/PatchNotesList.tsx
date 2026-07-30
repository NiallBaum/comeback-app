import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { PatchEntry } from "@/types";

interface PatchNotesListProps {
  gameName: string;
  entries: PatchEntry[];
}

const MAX_ENTRIES = 5;
const CLIP_PATH = "[clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]";

// Steam's news feed bodies are BBCode, not HTML/Markdown — no renderer for
// that exists yet, so this strips the tags to plain, readable text rather
// than showing raw "[p]"/"[list]" markup. Order matters: known bbcode tags
// (img/url/list/p) are consumed first, so the catch-all at the end only
// ever sees Valve's own "\[ SECTION HEADER ]" convention, not real tags.
function cleanPatchBody(raw: string): string {
  return raw
    .replace(/\[img\][^[]*\[\/img\]/gi, "")
    .replace(/\[url="?[^\]]*"?\]/gi, "")
    .replace(/\[\/url\]/gi, "")
    .replace(/\[\*\]/g, "\n• ")
    .replace(/\[\/\*\]/g, "")
    .replace(/\[\/?list\]/gi, "")
    .replace(/\[\/?(p|b|i|u|h1|h2|h3)\]/gi, "\n")
    .replace(/\\?\[\s*([^\]]+?)\s*\\?\]/g, "\n\n$1\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

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
          <CardContent>
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {cleanPatchBody(entry.rawBody)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
