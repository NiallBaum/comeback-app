"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";

const CLIP_PATH = "[clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]";
const BADGE_CLIP_PATH = "[clip-path:polygon(6px_0,100%_0,100%_calc(100%-6px),calc(100%-6px)_100%,0_100%,0_6px)]";

interface SettingsTabsProps {
  email: string;
  steamId: string | null;
  steamPersonaName: string | null;
}

const TABS = [
  { id: "account", label: "Account" },
  { id: "connections", label: "Connections" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Riot/Battle.net aren't real connections yet - shown so the layout doesn't
// need reworking once they are, per the same "future platforms slot in
// without a redesign" pattern used for the old sign-up option list.
const UNAVAILABLE_PLATFORMS = [
  { id: "riot", label: "Riot Games", note: "League of Legends, Valorant" },
  { id: "battlenet", label: "Battle.net", note: "Battle.net games — patch notes only" },
];

export function SettingsTabs({ email, steamId, steamPersonaName }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("account");
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const router = useRouter();

  async function handleDisconnect() {
    setDisconnecting(true);
    await fetch("/api/settings/disconnect-steam", { method: "POST" });
    setDisconnecting(false);
    setConfirmingDisconnect(false);
    router.refresh();
  }

  return (
    <div className="grid gap-10 md:grid-cols-[200px_1fr]">
      <nav
        className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible"
        role="tablist"
        aria-label="Settings"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-sm border-l-2 px-3 py-2.5 text-left text-sm transition-colors ${
              activeTab === tab.id
                ? "border-brand bg-card font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:bg-card hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div>
        {activeTab === "account" && (
          <section className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold">Account</h2>
              <p className="text-sm text-muted-foreground">
                The email address your account is signed in with.
              </p>
            </div>
            <Card className={`rounded-none ${CLIP_PATH}`}>
              <CardContent className="flex flex-col gap-1">
                <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                  Email
                </span>
                <span className="text-base">{email}</span>
              </CardContent>
            </Card>
          </section>
        )}

        {activeTab === "connections" && (
          <section className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold">Connections</h2>
              <p className="text-sm text-muted-foreground">
                Link a platform account to personalize your dashboard for the games you play there.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Card className={`rounded-none ${CLIP_PATH}`}>
                <CardContent className="flex items-center gap-4">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center bg-muted-foreground/20 font-mono text-sm font-semibold ${BADGE_CLIP_PATH}`}
                  >
                    S
                  </div>
                  <div className="min-w-0 flex-1">
                    {steamId ? (
                      <>
                        <p className="flex items-center gap-1.5 font-medium">
                          <span className="size-1.5 rounded-full bg-add" />
                          Steam
                        </p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {steamPersonaName ? `${steamPersonaName} · ` : ""}
                          {steamId}
                        </p>
                      </>
                    ) : (
                      <p className="font-medium">Steam</p>
                    )}
                  </div>

                  {steamId ? (
                    confirmingDisconnect ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmingDisconnect(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDisconnect}
                          disabled={disconnecting}
                        >
                          {disconnecting ? "Disconnecting…" : "Disconnect"}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmingDisconnect(true)}
                      >
                        Disconnect
                      </Button>
                    )
                  ) : (
                    <Link
                      href="/api/auth/steam/login"
                      className={buttonVariants({
                        size: "sm",
                        className: "bg-brand text-brand-foreground hover:bg-brand/90",
                      })}
                    >
                      Connect
                    </Link>
                  )}
                </CardContent>
              </Card>

              {UNAVAILABLE_PLATFORMS.map((platform) => (
                <Card key={platform.id} className={`rounded-none opacity-60 ${CLIP_PATH}`}>
                  <CardContent className="flex items-center gap-4">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center bg-muted-foreground/10 font-mono text-sm font-semibold text-muted-foreground ${BADGE_CLIP_PATH}`}
                    >
                      {platform.label[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-muted-foreground">{platform.label}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">{platform.note}</p>
                    </div>
                    <span className="border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      Coming soon
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
