import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { SettingsTabs } from "@/components/settings/SettingsTabs";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-up");
  }

  return (
    <main className="max-w-[1100px] w-full mx-auto px-4 py-14">
      <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
        // settings
      </span>
      <h1 className="mt-1 mb-10 text-3xl font-bold tracking-tight">Manage your account</h1>

      <SettingsTabs
        email={session.user.email}
        steamId={session.user.steamId ?? null}
        steamPersonaName={session.user.steamPersonaName ?? null}
      />
    </main>
  );
}
