import { Suspense } from "react";
import { SignupOptions } from "@/components/signup/SignupOptions";

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          // sign up
        </span>
        <h1 className="mt-1 mb-8 text-3xl font-bold tracking-tight">Get started</h1>
        <Suspense fallback={null}>
          <SignupOptions />
        </Suspense>
      </div>
    </main>
  );
}