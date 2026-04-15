"use client";

import Image from "next/image";
import { useState } from "react";
import { builder } from "clash-of-clans-data";
import type { BuilderBaseData } from "@/types/app/game";
import type { Playthrough } from "@/types/app/playthrough";
import { LeagueRewardsModal, type BuilderLeagueData } from "./LeagueRewardsModal";
import { SectionCard } from "./SectionCard";
import { ProgressCard } from "./ProgressCard";
import { ItemGrid } from "./ItemGrid";
import { HeroCard } from "./HeroCard";
import {
  calcBuilderStructuresProgress,
  calcBuilderTrapsProgress,
  calcBuilderLabProgress,
  calcBuilderHeroesProgress,
  calcBuilderWallsProgress,
  calcDaysAt,
  getBuilderWallData,
} from "@/lib/utils/progressHelpers";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";

// Module-level data — init once
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawItem = { name: string; images: { icon?: string }; levels: any[] };
type RawLeague = { name: string; image: string };
const _b = builder();
const _troops = _b.troops().get() as unknown as RawItem[];
const _heroes = _b.heroes().get() as unknown as RawItem[];

function getBuilderLeague(leagueName: string): RawLeague | undefined {
  // API stores "Titanium League I"; package uses "Titanium I"
  const normalized = leagueName.replace(" League", "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((_b.leagues() as any).byName(normalized).get() as RawLeague[])?.[0];
}

interface BuilderBaseSectionProps {
  bb: BuilderBaseData;
  playthrough: Playthrough;
}

export function BuilderBaseSection({ bb, playthrough }: BuilderBaseSectionProps) {
  const bhLevel = bb.builderHallLevel;
  const bhImageUrl = toPublicImageUrl(`images/builder/builder-hall/normal/level-${bhLevel}.png`);
  const days = calcDaysAt(playthrough.bhChangedAt);

  const [leagueModal, setLeagueModal] = useState<BuilderLeagueData | null>(null);

  // Progress
  const structuresProg = calcBuilderStructuresProgress(bb, bhLevel);
  const trapsProg = calcBuilderTrapsProgress(bb, bhLevel);
  const labProg = calcBuilderLabProgress(bb, bhLevel);
  const heroesProg = calcBuilderHeroesProgress(bb.heroes, bhLevel);
  const wallsProg = calcBuilderWallsProgress(bb.walls ?? {}, bhLevel);
  const { maxLevel: maxWallLevel, totalAtBH: totalWalls } = getBuilderWallData(bhLevel);
  const wallSub = totalWalls > 0 ? `${totalWalls} walls · max Lv ${maxWallLevel}` : "No wall data";

  // Item display lookups
  const getTroopData = (name: string) => {
    const t = _troops.find((t) => t.name.toLowerCase() === name);
    if (!t) return undefined;
    return { iconUrl: toPublicImageUrl(t.images?.icon), maxLevel: t.levels.length };
  };
  const getHeroData = (name: string) => {
    const t = _heroes.find((t) => t.name.toLowerCase() === name);
    if (!t) return undefined;
    return {
      iconUrl: toPublicImageUrl(t.images?.icon),
      maxLevel: t.levels.filter((l) => l.builderHallLevelRequired <= bhLevel).length,
    };
  };

  const builderLeague: BuilderLeagueData | null = bb.builderBaseLeagueName
    ? (() => {
        const raw = getBuilderLeague(bb.builderBaseLeagueName);
        if (!raw) return null;
        return {
          type: "builder" as const,
          name: raw.name,
          image: raw.image,
          trophyMin: (raw as any).trophyMin ?? null,
          trophyMax: (raw as any).trophyMax ?? null,
          starBonus: (raw as any).starBonus ?? null,
          battleResults: (raw as any).battleResults ?? [],
        };
      })()
    : null;

  return (
    <section className="mb-8">
      <LeagueRewardsModal league={leagueModal} onClose={() => setLeagueModal(null)} />

      {/* Section header */}
      <div className="mb-3 flex items-center gap-3 rounded-xl border border-secondary/80 bg-primary px-4 py-3">
        <div className="relative h-10 w-10 shrink-0">
          <Image src={bhImageUrl} alt={`BH${bhLevel}`} fill sizes="40px" className="object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-extrabold text-white leading-tight">Builder Base</h2>
          <div className="text-xs text-white/80">
            Builder Hall {bhLevel}
            {bb.builderBaseTrophies > 0 ? ` · ${bb.builderBaseTrophies.toLocaleString()} trophies` : ""}
          </div>
        </div>
        {builderLeague && (
          <button
            type="button"
            onClick={() => setLeagueModal(builderLeague)}
            className="shrink-0 flex flex-col items-center gap-0.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="relative h-10 w-10">
              <Image src={toPublicImageUrl(builderLeague.image)} alt={builderLeague.name} fill sizes="40px" className="object-contain" />
            </div>
            <div className="text-[10px] font-bold text-white/80 text-center leading-tight">{builderLeague.name}</div>
          </button>
        )}
        {days > 0 && (
          <div className="shrink-0 text-right">
            <div className="text-xl font-extrabold leading-none text-accent">{days}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/80">Days at BH{bhLevel}</div>
          </div>
        )}
      </div>

      {/* Progress grid — 2-col */}
      {(structuresProg.max > 0 || labProg.max > 0 || heroesProg.max > 0 || wallsProg.max > 0) && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {structuresProg.max > 0 && (
            <ProgressCard label="Structures" result={structuresProg} sub="Defenses · Army · Resource" />
          )}
          {trapsProg.max > 0 && (
            <ProgressCard label="Traps" result={trapsProg} />
          )}
          {labProg.max > 0 && (
            <ProgressCard label="Lab" result={labProg} sub="Builder Troops" />
          )}
          {heroesProg.max > 0 && (
            <ProgressCard label="Heroes" result={heroesProg} />
          )}
          {wallsProg.max > 0 && (
            <ProgressCard label="Walls" result={wallsProg} sub={wallSub} />
          )}
        </div>
      )}

      {/* Items — Troops (left) | Heroes (right) */}
      {(bb.troops.length > 0 || bb.heroes.length > 0) && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {bb.troops.length > 0 && (
            <SectionCard title="Troops">
              <ItemGrid items={bb.troops} getItemData={getTroopData} />
            </SectionCard>
          )}
          {bb.heroes.length > 0 && (
            <SectionCard title="Heroes">
              <div className="flex flex-wrap gap-2">
                {bb.heroes.map((hero) => {
                  const d = getHeroData(hero.name.toLowerCase());
                  return (
                    <HeroCard
                      key={hero.name}
                      hero={hero}
                      heroIconUrl={d?.iconUrl ?? ""}
                      maxHeroLevel={d?.maxLevel ?? 0}
                      getEquipmentData={() => undefined}
                    />
                  );
                })}
              </div>
            </SectionCard>
          )}
        </div>
      )}
    </section>
  );
}
