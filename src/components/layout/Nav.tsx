import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/steam/session";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";

const SECTION_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#supported-games", label: "Supported games" },
];

export async function Nav() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  const isLoggedIn = session?.status === "valid";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-6 px-4">
        <Logo className="text-lg" />

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {SECTION_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                Dashboard
              </Link>
              <Link
                href="/api/auth/steam/logout"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Sign out
              </Link>
            </>
          ) : (
            <Link
              href="/api/auth/steam/login"
              className={buttonVariants({
                size: "sm",
                className: "bg-brand text-brand-foreground hover:bg-brand/90",
              })}
            >
              Connect Steam
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
