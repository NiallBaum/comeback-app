import { SparklesIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CLIP_PATH = "[clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]";

// Placeholder for the Phase 2 AI-synthesized recap (see plan of attack) - a
// real ReinstallRecap component will render in this exact spot once the
// synthesis pipeline is built. Labeled "coming soon" so it never gets
// mistaken for a real, working feature in the meantime.
export function ReinstallRecapTeaser({ gameName }: { gameName: string }) {
  return (
    <Card className={`mb-6 rounded-none border-dashed bg-muted/40 ${CLIP_PATH}`}>
      <CardContent className="flex items-start gap-3 py-5">
        <SparklesIcon className="mt-0.5 size-4 shrink-0 text-brand" />
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wide text-foreground">
              is {gameName.toLowerCase()} worth reinstalling?
            </span>
            <span className="rounded-full bg-brand/15 px-2 py-0.5 font-mono text-[9px] uppercase text-brand">
              coming soon
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            We&apos;re building an AI-generated recap that reads the patch notes below and tells you, in plain
            English, whether it&apos;s worth jumping back in.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
