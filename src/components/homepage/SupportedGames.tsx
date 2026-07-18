import { SUPPORTED_GAMES } from "@/lib/games";
import { getSteamHeaderUrl } from "@/lib/steam/assets";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export function SupportedGames() {
  return (
    <section id="supported-games" className="border-t border-border py-16">
      <span className="font-mono text-xs uppercase tracking-wide text-brand">
        Supported games
      </span>
      <h2 className="mt-2 mb-10 text-2xl font-semibold tracking-tight text-balance">
        Three games deep enough to need this.
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SUPPORTED_GAMES.map((game) => (
          <Card key={game.id} className="overflow-hidden pt-0">
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={getSteamHeaderUrl(game.id)}
                alt=""
                className="aspect-[16/6] w-full rounded-t-lg object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent to-15%" />
            </div>
            <CardHeader>
              <CardTitle>{game.name}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
