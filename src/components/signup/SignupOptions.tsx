"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";

const CLIP_PATH = "[clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]";

export function SignupOptions() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const searchParams = useSearchParams();
  const steamRequired = searchParams.get("steam") === "required";
  // Better Auth's own error-redirect always sets its own `error` code here
  // (e.g. INVALID_TOKEN) - we don't control or match its exact value, any
  // presence of it means the link failed.
  const invalidLink = searchParams.has("error");

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL: "/dashboard",
      errorCallbackURL: "/sign-up",
    });
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
      {steamRequired && (
        <p className="font-mono text-xs text-muted-foreground before:content-['//_']">
          create an account first, then connect Steam from settings
        </p>
      )}

      {invalidLink && (
        <p className="font-mono text-xs text-destructive before:content-['//_']">
          that link expired or was already used — request a new one below
        </p>
      )}

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