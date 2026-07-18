import Link from "next/link";
import { cn } from "@/lib/utils";

// The chevron sits at the wordmark's own weight seam (light "come" into
// bold "back") in place of a space — see the naming/mark review for the
// rest of the rejected directions.
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center font-bold tracking-tight text-foreground",
        className
      )}
    >
      <span className="font-medium text-muted-foreground">come</span>
      <svg
        viewBox="16 20 54 60"
        aria-hidden="true"
        className="mx-[0.02em] inline-block h-[0.62em] w-[0.62em]"
      >
        <polyline
          points="24,36 40,50 24,64"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
        />
        <polyline
          points="40,30 62,50 40,70"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      back
    </Link>
  );
}
