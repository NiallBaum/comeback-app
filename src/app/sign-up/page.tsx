import { Suspense } from "react";
import { SignupOptions } from "@/components/signup/SignupOptions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  // Sign in and sign up are the same magic-link form underneath - this
  // just carries which nav button was clicked so the heading matches,
  // since landing on "Get started" after clicking "Sign in" reads wrong.
  const { intent } = await searchParams;
  const isSignIn = intent === "sign-in";

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          {isSignIn ? "// sign in" : "// sign up"}
        </span>
        <h1 className="mt-1 mb-8 text-3xl font-bold tracking-tight">
          {isSignIn ? "Welcome back" : "Get started"}
        </h1>
        <Suspense fallback={null}>
          <SignupOptions />
        </Suspense>
      </div>
    </main>
  );
}