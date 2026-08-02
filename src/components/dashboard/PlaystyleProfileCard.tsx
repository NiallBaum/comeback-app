import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { PlaystyleProfile } from "@/lib/adapters/dota2/playstyle";

interface PlaystyleProfileCardProps {
  heroName: string;
  profile: PlaystyleProfile;
}

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function PlaystyleProfileCard({ heroName, profile }: PlaystyleProfileCardProps) {
  const stats = [
    { label: "Gold per min", value: Math.round(profile.goldPerMin).toString() },
    { label: "XP per min", value: Math.round(profile.xpPerMin).toString() },
    { label: "Hero damage", value: compactNumber.format(profile.heroDamage) },
    { label: "Hero healing", value: compactNumber.format(profile.heroHealing) },
    { label: "Observer wards", value: profile.wardsPlaced.toFixed(1) },
    { label: "KDA", value: profile.kda.toFixed(1) },
  ];

  return (
    <Card className="rounded-none [clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]">
      <CardHeader>
        <CardTitle>Playstyle profile — {heroName}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <dt className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </dt>
              <dd className="text-2xl font-semibold">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
