import { Hero } from "@/components/homepage/Hero";
import { HowItWorks } from "@/components/homepage/HowItWorks";
import { SupportedGames } from "@/components/homepage/SupportedGames";

export default function Home() {

  return (
    <div className="max-w-[1440px] w-full mx-auto px-4 py-8">
      <Hero />
      <HowItWorks />
      <SupportedGames />
    </div>
  );
}
