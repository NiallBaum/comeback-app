import { CtaButton } from "@/components/homepage/CtaButton";

export function ClosingCta() {
  return (
    <section className="border-t border-border py-14 text-center">
      <h2 className="mx-auto mb-6 max-w-[26ch] text-2xl font-bold tracking-tight text-balance md:text-3xl">
        Your account already knows what changed. We just read it back to you.
      </h2>
      <CtaButton href="/sign-up">sign_up</CtaButton>
      <p className="mt-8 font-mono text-[0.68rem] text-muted-foreground opacity-75">
        Game art and marks are property of their respective owners &middot; used for identification only
      </p>
    </section>
  );
}
