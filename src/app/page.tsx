import { Hero } from "@/components/homepage/Hero";
import { TwoTiers } from "@/components/homepage/TwoTiers";
import { SupportedGames } from "@/components/homepage/SupportedGames";
import { ClosingCta } from "@/components/homepage/ClosingCta";

export default function Home() {

  return (
    <div className="max-w-[1440px] w-full mx-auto px-4 py-8">
      <Hero />
      <TwoTiers />
      <SupportedGames />
      <ClosingCta />
    </div>
  );
}
