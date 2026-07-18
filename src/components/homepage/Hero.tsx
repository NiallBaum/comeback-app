import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getSteamHeaderUrl } from "@/lib/steam/assets";
import type { GameId } from "@/types";


export function Hero() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 py-16">
      <div className="flex flex-col items-start gap-4">
        <span className="font-mono uppercase tracking-wide text-xs text-brand">
          Welcome back
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          Welcome back. Here&rsquo;s what you missed.
        </h1>
        <p className="max-w-prose text-muted-foreground">
          Connect Steam and Comeback checks what changed in the games you&rsquo;ve left behind — then tells you exactly what to play when you jump back in.
        </p>
        <Link
          href="/api/auth/steam/login"
          className={buttonVariants({ size: "lg", className: "mt-2 bg-brand text-brand-foreground hover:bg-brand/90" })}
        >
          Connect Steam
        </Link>
      </div>
      <div className="relative w-[32rem] mx-auto h-56 flex items-center align-middle justify-center">
        {(["dbd", "destiny2", "poe"] as GameId[]).map((gameId, index) => {
          const positions = [
            "left-0 top-8 -rotate-6 z-0",
            "left-24 top-0 rotate-2 z-10",
            "left-48 top-10 rotate-6 z-20",
          ];
          return (
            <img
              key={gameId}
              src={getSteamHeaderUrl(gameId)}
              alt=""
              className={`absolute w-80 aspect-[16/9] rounded-lg border border-border object-cover shadow-xl ${positions[index]}`}
            />
          );
        })}
      </div>
    </section>
  );
}
