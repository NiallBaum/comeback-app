import { SUPPORTED_GAMES } from "@/lib/games";
import { getSteamHeaderUrl } from "@/lib/steam/assets";
import { mockPoeBuilds, mockDota2Builds, mockDbdBuilds } from "@/lib/mock/builds";
import type { BuildRecommendation, GameId } from "@/types";

function abbreviate(name: string) {
  const words = name.split(" ").filter(Boolean);
  if (words.length > 1) return words.map((w) => w[0]).join("").toUpperCase().slice(0, 3);
  return name.slice(0, 2).toUpperCase();
}

const SHOWCASE: Array<{
  id: GameId;
  tag: string;
  tagColor: string;
  heading: string;
  diffline: string;
  neutral?: boolean;
  build: BuildRecommendation;
}> = [
  {
    id: "poe",
    tag: "ARPG",
    tagColor: "text-brand",
    heading: "Ladder data, not opinions",
    diffline: mockPoeBuilds[0].whyItWorksNow,
    build: mockPoeBuilds[0],
  },
  {
    id: "dota2",
    tag: "MOBA",
    tagColor: "text-[#8a6dd6]",
    heading: "Straight from Valve's own patch feed",
    diffline: mockDota2Builds[0].whyItWorksNow,
    build: mockDota2Builds[0],
  },
  {
    id: "dbd",
    tag: "Asymmetric horror",
    tagColor: "text-[#b1585a]",
    heading: "Honest about what we don't know",
    diffline: mockDbdBuilds[0].whyItWorksNow,
    neutral: true,
    build: mockDbdBuilds[0],
  },
];

export function SupportedGames() {
  return (
    <section className="border-t border-border py-16" id="games">
      <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
        // three games, checked for real
      </span>
      <div className="mt-8 flex flex-col gap-14">
        {SHOWCASE.map((entry, index) => {
          const game = SUPPORTED_GAMES.find((g) => g.id === entry.id)!;
          const isDataBacked = entry.build.confidence === "data-backed";
          return (
            <div
              key={entry.id}
              className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-11"
            >
              <div className={index % 2 === 1 ? "md:order-2" : ""}>
                <img
                  src={getSteamHeaderUrl(game.id)}
                  alt={game.name}
                  className="aspect-video w-full rounded-sm object-cover"
                />
              </div>
              <div className={index % 2 === 1 ? "md:order-1" : ""}>
                <div className={`mb-2 font-mono text-xs uppercase tracking-wide ${entry.tagColor}`}>
                  {entry.tag} &middot; {game.name}
                </div>
                <h3 className="mb-3 text-2xl font-bold tracking-tight">{entry.heading}</h3>
                <div
                  className={`mb-4 font-mono text-sm ${entry.neutral ? "text-muted-foreground before:content-['~_']" : "text-add before:content-['+_']"}`}
                >
                  {entry.diffline}
                </div>
                <div className="border border-border bg-card p-5 [clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)]">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{entry.build.characterOrClass}</span>
                      <span className="font-semibold">{entry.build.label}</span>
                    </div>
                    <span
                      className={`ml-auto self-start whitespace-nowrap border px-2 py-0.5 font-mono text-[0.62rem] tracking-wide ${
                        isDataBacked ? "border-add/45 text-add" : "border-border text-muted-foreground"
                      }`}
                    >
                      {isDataBacked ? "DATA-BACKED" : "COMMUNITY"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.build.items.map((item) => (
                      <div
                        key={item.name}
                        title={item.name}
                        className="flex size-8 items-center justify-center border border-border bg-background font-mono text-[0.6rem] text-muted-foreground"
                      >
                        {item.iconUrl ? (
                          <img src={item.iconUrl} alt={item.name} className="size-full object-cover" />
                        ) : (
                          abbreviate(item.name)
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
