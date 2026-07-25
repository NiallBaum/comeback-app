import Link from "next/link";

// Bracket CTA: on hover the [ ] slide apart and a terminal cursor blinks after
// the label, extending the changelog/terminal motif instead of a generic pill.
export function CtaButton({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-[0.15em] bg-brand text-brand-foreground font-mono text-sm font-medium px-5 py-3.5 transition-[filter] hover:brightness-[1.06] [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]"
    >
      <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.75">
        [
      </span>
      <span className="px-[0.35em]">{children}</span>
      <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.75">
        ]
      </span>
      <span className="inline-block h-[1em] w-[0.5em] bg-current opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-hover:animate-cta-blink" />
    </Link>
  );
}
