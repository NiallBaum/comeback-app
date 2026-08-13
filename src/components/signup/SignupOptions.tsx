"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";

const CLIP_PATH = "[clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]";

// Every platform a user can start an account with, rendered as equal peer
// options in one list - Riot/Battle.net slot in here later without needing
// to redesign this page. Steam is a plain link (its own OpenID handshake,
// unrelated to Better Auth's client SDK); future platforms follow the same
// shape once they exist.
const CONNECT_OPTIONS = [{ id: "steam", label: "continue_with_steam", href: "/api/auth/steam/login" }];

export function SignupOptions() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const { error } = await authClient.signIn.magicLink({ email, callbackURL: "/dashboard" });
    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <p className="font-mono text-sm text-add before:content-['+_']">
        check your inbox — we sent a sign-in link to {email}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {CONNECT_OPTIONS.map((option) => (
        <a
          key={option.id}
          href={option.href}
          className={`flex items-center justify-center border border-border bg-card px-5 py-3.5 font-mono text-sm font-medium transition-colors hover:border-brand/45 hover:text-brand ${CLIP_PATH}`}
        >
          {option.label}
        </a>
      ))}

      <div className="flex items-center gap-3 py-1 font-mono text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="border border-border bg-background px-3 py-2.5 font-mono text-sm text-foreground focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className={`bg-brand px-5 py-3.5 font-mono text-sm font-medium text-brand-foreground transition-[filter] hover:brightness-[1.06] disabled:opacity-60 ${CLIP_PATH}`}
        >
          {status === "sending" ? "sending..." : "continue_with_email"}
        </button>
        {status === "error" && (
          <p className="font-mono text-xs text-destructive">Something went wrong — try again.</p>
        )}
      </form>
    </div>
  );
}