"use client";

import { useRouter } from "next/navigation";

interface HeroPickerProps {
  gameId: string;
  heroes: string[];
  selectedHero?: string;
}

export function HeroPicker({ gameId, heroes, selectedHero }: HeroPickerProps) {
  const router = useRouter();

  return (
    <select
      defaultValue={selectedHero ?? ""}
      onChange={(e) => router.push(`/dashboard?game=${gameId}&hero=${encodeURIComponent(e.target.value)}`)}
      className="mt-3 w-full max-w-xs border border-border bg-background px-3 py-2 font-mono text-xs uppercase tracking-wide text-foreground focus:border-brand focus:outline-none"
    >
      <option value="" disabled>
        Select a hero
      </option>
      {heroes.map((hero) => (
        <option key={hero} value={hero}>
          {hero}
        </option>
      ))}
    </select>
  );
}
