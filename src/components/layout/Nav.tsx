import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";

const SECTION_LINKS = [{ href: "/#games", label: "Games" }];

export async function Nav() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isLoggedIn = !!session;

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
              <form action="/api/logout" method="POST">
                <button type="submit" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/sign-up"
              className={buttonVariants({
                size: "sm",
                className: "bg-brand text-brand-foreground hover:bg-brand/90",
              })}
            >
              Sign up
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}