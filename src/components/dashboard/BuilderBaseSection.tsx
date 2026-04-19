"use client";

import Image from "next/image";
import { useState } from "react";
import { builder } from "clash-of-clans-data";
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
import type { RawItem, RawLeague, RawResourceBuilding } from "@/types/app/rawData";
const _b = builder();
const _troops = _b.troops().get() as unknown as RawItem[];
const _heroes = _b.heroes().get() as unknown as RawItem[];
const _rbMap = new Map((_b.resourceBuildings().get() as RawResourceBuilding[]).map((b) => [b.id, b]));

const getBuilderLeague = (leagueName: string): RawLeague | undefined  => {
  // API stores "Titanium League I"; package uses "Titanium I"
  const normalized = leagueName.replace(" League", "");
  return ((_b.leagues() as any).byName(normalized).get() as RawLeague[])?.[0];
}

import type { BuilderBaseSectionProps } from "@/types/components/dashboard";

export const BuilderBaseSection = ({ bb, playthrough }: BuilderBaseSectionProps) => {
  const bhLevel = bb.builderHallLevel;
  const bhImageUrl = toPublicImageUrl(`images/builder/builder-hall/normal/level-${bhLevel}.png`);
  const days = calcDaysAt(playthrough.bhChangedAt);

  const [leagueModal, setLeagueModal] = useState<BuilderLeagueData | null>(null);

  const structuresProg = calcBuilderStructuresProgress(bb, bhLevel);
  const trapsProg = calcBuilderTrapsProgress(bb, bhLevel);
  const labProg = calcBuilderLabProgress(bb, bhLevel);
  const heroesProg = calcBuilderHeroesProgress(bb.heroes, bhLevel);
  const wallsProg = calcBuilderWallsProgress(bb.walls ?? {}, bhLevel);
  const { maxLevel: maxWallLevel, totalAtBH: totalWalls } = getBuilderWallData(bhLevel);
  const wallSub = totalWalls > 0 ? `${totalWalls} walls · max Lv ${maxWallLevel}` : "No wall data";

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

  const sumInstanceField = (buildingId: string, field: "capacity" | "productionRate") => {
    const building = _rbMap.get(buildingId);
    if (!building) return 0;
    const instances = bb.resourceBuildings[buildingId] ?? [];
    return instances.reduce((sum, inst) => {
      if (inst.level === 0) return sum;
      const lvl = building.levels.find((l) => l.level === inst.level && (l as any).builderHallRequired <= bhLevel);
      return sum + (lvl?.[field] ?? 0);
    }, 0);
  };

  const goldProduction = sumInstanceField("gold-mine", "productionRate");
  const elixirProduction = sumInstanceField("elixir-collector", "productionRate");
  const goldStorage = sumInstanceField("gold-storage", "capacity");
  const elixirStorage = sumInstanceField("elixir-storage", "capacity");
  const hasResourceData = goldStorage > 0 || elixirStorage > 0;

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
        {hasResourceData && (
          <div className="shrink-0 flex gap-2">
            <div className="flex flex-col gap-0.5">
              {goldProduction > 0 && (
                <div className="flex items-center gap-1">
                  <div className="relative h-3.5 w-3.5 shrink-0">
                    <Image src="/images/other/gold-b.png" alt="Gold" fill sizes="14px" className="object-contain" />
                  </div>
                  <span className="text-[10px] text-white/80">{goldProduction.toLocaleString()}/h</span>
                </div>
              )}
              {elixirProduction > 0 && (
                <div className="flex items-center gap-1">
                  <div className="relative h-3.5 w-3.5 shrink-0">
                    <Image src="/images/other/elixir-b.png" alt="Elixir" fill sizes="14px" className="object-contain" />
                  </div>
                  <span className="text-[10px] text-white/80">{elixirProduction.toLocaleString()}/h</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              {goldStorage > 0 && (
                <div className="flex items-center gap-1">
                  <div className="relative h-3.5 w-3.5 shrink-0">
                    <Image src="/images/other/gold-b.png" alt="Gold" fill sizes="14px" className="object-contain" />
                  </div>
                  <span className="text-[10px] font-bold text-white/80">{goldStorage.toLocaleString()}</span>
                </div>
              )}
              {elixirStorage > 0 && (
                <div className="flex items-center gap-1">
                  <div className="relative h-3.5 w-3.5 shrink-0">
                    <Image src="/images/other/elixir-b.png" alt="Elixir" fill sizes="14px" className="object-contain" />
                  </div>
                  <span className="text-[10px] font-bold text-white/80">{elixirStorage.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
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
