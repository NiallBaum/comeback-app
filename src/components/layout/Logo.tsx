import Link from "next/link";
import { cn } from "@/lib/utils";

// Icon and wordmark are kept as two separate elements rather than fused —
// welding an icon into the letterforms (the previous version) is a much
// harder trick to land than an icon badge sitting next to plain text.
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2 font-bold tracking-tight text-foreground",
        className
      )}
    >
      <span className="relative flex size-[1.7em] shrink-0 items-center justify-center overflow-hidden rounded-[0.24em] bg-brand">
        <span className="absolute top-0 left-0 flex h-full w-[200%] -translate-x-1/2 motion-reduce:animate-none! group-hover:animate-chevron-slide">
          <ChevronCell />
          <ChevronCell />
        </span>
      </span>
      Comeback
    </Link>
  );
}

function ChevronCell() {
  return (
    <span className="flex h-full w-1/2 shrink-0 items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-[1.2em]">
        <path
          d="M7 5 L16 12 L7 19"
          stroke="var(--background)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
