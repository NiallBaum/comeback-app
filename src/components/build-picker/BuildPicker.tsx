"use client";

import { useState, useEffect } from "react";
import type { BuildRecommendation } from "@/types";
import { BuildCard } from "./BuildCard";
import { AnimatePresence, motion } from "framer-motion";
import { getSteamHeaderUrl } from "@/lib/steam/assets";
import { Card, CardContent } from "@/components/ui/card";
import { SwordIcon } from "lucide-react";
import { 
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs'
import { 
  Select, 
  SelectTrigger, 
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

interface BuildPickerProps {
  builds: BuildRecommendation[];
}

// Reusable across all 3 games (spec section 6b) — only `builds` differs per
// game (killers/perks, subclasses/loadouts, ascendancies/builds). Framer
// Motion handles tab-switch and card entrance transitions.
export function BuildPicker({ builds }: BuildPickerProps) {
  const [leagueMode, setLeagueMode] = useState<string | undefined>();

  const leagueModes = [...new Set(builds.map(b => b.leagueMode).filter(Boolean))]

  const visibleBuilds = leagueModes.length > 1 ? builds.filter((b) => b.leagueMode === (leagueMode ?? leagueModes[0])) : builds

  const [activeTab, setActiveTab] = useState(visibleBuilds[0]?.characterOrClass);
  useEffect(() => {
    setActiveTab(visibleBuilds[0]?.characterOrClass);
  }, [leagueMode]);

  if (builds.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
          <SwordIcon className="size-6 text-muted-foreground" />
          <p className="font-medium">No build recommendations right now</p>
          <p className="text-sm text-muted-foreground">
            The data source is temporarily unavailable — try refreshing in a bit.
          </p>
        </CardContent>
      </Card>
    );
  }

  const headerUrl = getSteamHeaderUrl(builds[0].gameId)

  return (
    <div>
      <div className="relative mb-4 overflow-hidden rounded-t-lg">
        <img
          src={headerUrl}
          alt=""
          className="aspect-[16/6] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent to-40%" />

      </div>
      {leagueModes.length > 1 && (
        <div className="mb-3">
          <Select value={leagueMode ?? leagueModes[0]} onValueChange={(value) => setLeagueMode(value ?? undefined)}>
            <SelectTrigger size="sm">
              <SelectValue className="capitalize" />
            </SelectTrigger>
            <SelectContent>
              {leagueModes.map((mode) => (
                <SelectItem key={mode} value={mode as string} className="capitalize">
                  {mode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <AnimatePresence mode="popLayout">
            {visibleBuilds.map((build) => (
              <motion.div
                key={`${build.characterOrClass}-${build.label}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TabsTrigger value={`${build.characterOrClass}-${build.label}`}>
                  {build.characterOrClass}
                </TabsTrigger>
              </motion.div>
            ))}
          </AnimatePresence>
        </TabsList>

        {visibleBuilds.map((build) => (
          <TabsContent key={`${build.characterOrClass}-${build.label}`} value={`${build.characterOrClass}-${build.label}`}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <BuildCard build={build} />
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
