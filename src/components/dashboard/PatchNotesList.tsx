import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { PatchEntry } from "@/types";

interface PatchNotesListProps {
  gameName: string;
  entries: PatchEntry[];
}

const MAX_ENTRIES = 5;
const CLIP_PATH = "[clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]";

type PatchBlock = { type: "header" | "bullet" | "text"; text: string };

// Steam's news feed bodies are BBCode, not HTML/Markdown — no renderer for
// that exists yet, so this parses tags into typed blocks (rather than one
// flat string) so headers can get real visual distinction from body text.
// Order matters: known bbcode tags (img/url/list/p) are consumed first, so
// the catch-all at the end only ever sees Valve's own non-standard
// "\[ SECTION HEADER ]" convention, not real tags. List items are
// "[*][p]text[/p][/*]" — the compound pairs are collapsed first, so the
// bullet marker and its text never get split apart by the generic
// [p]/[/p] rule.
function parsePatchBody(raw: string): PatchBlock[] {
  const tagged = raw
    .replace(/\[img\][^[]*\[\/img\]/gi, "")
    .replace(/\[url="?[^\]]*"?\]/gi, "")
    .replace(/\[\/url\]/gi, "")
    .replace(/\[\*\]\s*\[p\]/gi, "\n@@bullet@@")
    .replace(/\[\/p\]\s*\[\/\*\]/gi, "\n")
    .replace(/\[\*\]/g, "\n@@bullet@@")
    .replace(/\[\/\*\]/g, "")
    .replace(/\[\/?list\]/gi, "")
    .replace(/\[\/?(p|b|i|u|h1|h2|h3)\]/gi, "\n")
    .replace(/\\?\[\s*([^\]]+?)\s*\\?\]/g, "\n@@header@@$1\n");

  return tagged
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): PatchBlock => {
      if (line.startsWith("@@header@@")) return { type: "header", text: line.slice(10) };
      if (line.startsWith("@@bullet@@")) return { type: "bullet", text: line.slice(10) };
      return { type: "text", text: line };
    });
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
          <CardContent className="flex flex-col gap-2 text-sm">
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
