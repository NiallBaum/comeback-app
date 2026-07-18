import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

const FOOTER_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#supported-games", label: "Supported games" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo className="text-lg" />
          <p className="max-w-prose text-sm text-muted-foreground">
            Tells you what changed in the games you left behind.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-[1440px] px-4 py-4 font-mono text-xs text-muted-foreground">
          © {new Date().getFullYear()} Comeback
        </p>
      </div>
    </footer>
  );
}
