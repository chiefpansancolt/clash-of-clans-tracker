"use client";

import Link from "next/link";
import { Button, Card } from "flowbite-react";
import { HiViewGrid } from "react-icons/hi";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { PlayerHeader } from "@/comps/dashboard/PlayerHeader";
import { HomeVillageSection } from "@/comps/dashboard/HomeVillageSection";
import { BuilderBaseSection } from "@/comps/dashboard/BuilderBaseSection";
import { ClanCapitalSection } from "@/comps/dashboard/ClanCapitalSection";
import { calcAchievementsProgress } from "@/lib/utils/progressHelpers";

export default function DashboardPage() {
  const { activePlaythrough } = usePlaythrough();

  if (!activePlaythrough) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="max-w-md text-center">
          <h2 className="text-xl font-semibold text-white">No Active Village</h2>
          <p className="text-white/80">Select or create a village to see your dashboard.</p>
          <Button as={Link} href="/playthrough/list" color="action">
            <HiViewGrid className="mr-2 h-5 w-5" />
            Go to Villages
          </Button>
        </Card>
      </div>
    );
  }

  const { data } = activePlaythrough;
  const achievementsProgress = calcAchievementsProgress(data.achievements);

  return (
    <div className="p-4 md:p-6">
      <PlayerHeader playthrough={activePlaythrough} achievementsProgress={achievementsProgress} />
      <HomeVillageSection hv={data.homeVillage} playthrough={activePlaythrough} />
      <BuilderBaseSection bb={data.builderBase} playthrough={activePlaythrough} />
      {activePlaythrough.clanCapitalEnabled && (
        <ClanCapitalSection data={data.clanCapital} />
      )}
    </div>
  );
}
