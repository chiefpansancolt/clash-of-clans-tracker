"use client";

import Image from "next/image";
import { useState } from "react";
import { home, rankedBattles } from "clash-of-clans-data";
import { LeagueRewardsModal, type HomeLeagueData, type HomeLeagueLoot } from "./LeagueRewardsModal";
import { SectionCard } from "./SectionCard";
import { ProgressCard } from "./ProgressCard";
import { ItemGrid } from "./ItemGrid";
import { HeroCard } from "./HeroCard";
import {
  calcHomeStructuresProgress,
  calcHomeTrapsProgress,
  calcHomeLabProgress,
  calcHomeHeroesProgress,
  calcEquipmentProgress,
  calcPetsProgress,
  calcWallsProgress,
  calcSuperchargeProgress,
  calcCraftedDefensesProgress,
  calcDaysAt,
  getHomeWallData,
  getMaxHeroHallLevel,
  regularTroopNames,
} from "@/lib/utils/progressHelpers";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import type { RawItem, RawTroop, RawResourceBuilding } from "@/types/app/rawData";
const _h = home();
const _troops = _h.troops().get() as RawTroop[];
// Precompute sort order: Elixir troops first, Dark Elixir second
const _troopSortOrder = new Map<string, number>(
  _troops.map((t) => [
    t.name.toLowerCase(),
    t.levels[0]?.researchCostResource === "Dark Elixir" ? 1 : 0,
  ])
);
const _spells = _h.spells().get() as RawItem[];
const _siege = _h.siegeMachines().get() as RawItem[];
const _pets = _h.pets().get() as RawItem[];
const _heroes = _h.heroes().get() as RawItem[];
const _equip = _h.heroEquipment().get() as RawItem[];
const _leagues = rankedBattles();

import type { HomeVillageSectionProps } from "@/types/components/dashboard";

const _resourceBuildings = _h.resourceBuildings().get() as RawResourceBuilding[];
const _rbMap = new Map(_resourceBuildings.map((b) => [b.id, b]));
const _thLevels = (_h.townHall().get() as any[])[0]?.levels as Array<{ level: number; storageCapacity: { gold: number; elixir: number; darkElixir: number } }> ?? [];

export const HomeVillageSection = ({ hv, playthrough }: HomeVillageSectionProps) => {
  const thLevel = hv.townHallLevel;
  const thImageUrl = toPublicImageUrl(`images/home/town-hall/normal/level-${thLevel}.png`);
  const days = calcDaysAt(playthrough.thChangedAt);
  const maxHeroHallLevel = getMaxHeroHallLevel(thLevel);

  const structuresProg = calcHomeStructuresProgress(hv, thLevel);
  const trapsProg = calcHomeTrapsProgress(hv, thLevel);
  const labProg = calcHomeLabProgress(hv, thLevel);
  const heroesProg = calcHomeHeroesProgress(hv.heroes, thLevel);
  const equipProg = calcEquipmentProgress(hv.heroes);
  const petsProg = calcPetsProgress(hv.pets, thLevel);
  const wallsProg = calcWallsProgress(hv.walls, thLevel);
  const superchargeProg = calcSuperchargeProgress(hv, thLevel);
  const craftedProg = calcCraftedDefensesProgress(hv, thLevel);
  const { maxLevel: maxWallLevel, totalAtTH: totalWalls } = getHomeWallData(thLevel);
  const wallSub = totalWalls > 0 ? `${totalWalls} walls · max Lv ${maxWallLevel}` : "No wall data";

  const getTroopData = (name: string) => {
    const t = _troops.find((t) => t.name.toLowerCase() === name);
    if (!t) return undefined;
    return {
      iconUrl: toPublicImageUrl(t.images?.icon),
      maxLevel: t.levels.filter((l) => l.townHallRequired <= thLevel).length,
    };
  };
  const getSpellData = (name: string) => {
    const t = _spells.find((t) => t.name.toLowerCase() === name);
    if (!t) return undefined;
    return {
      iconUrl: toPublicImageUrl(t.images?.icon),
      maxLevel: t.levels.filter((l) => l.townHallRequired <= thLevel).length,
    };
  };
  const getSiegeData = (name: string) => {
    const t = _siege.find((t) => t.name.toLowerCase() === name);
    if (!t) return undefined;
    return {
      iconUrl: toPublicImageUrl(t.images?.icon),
      maxLevel: t.levels.filter((l) => l.townHallRequired <= thLevel).length,
    };
  };
  const getPetData = (name: string) => {
    const t = _pets.find((t) => t.name.toLowerCase() === name);
    if (!t) return undefined;
    return { iconUrl: toPublicImageUrl(t.images?.icon), maxLevel: t.levels.length };
  };
  const getHeroData = (name: string) => {
    const t = _heroes.find((t) => t.name.toLowerCase() === name);
    if (!t) return undefined;
    return {
      iconUrl: toPublicImageUrl(t.images?.icon),
      maxLevel: t.levels.filter((l) => l.heroHallLevelRequired <= maxHeroHallLevel).length,
    };
  };
  const getEquipData = (name: string) => {
    const t = _equip.find((t) => t.name.toLowerCase() === name);
    if (!t) return undefined;
    return { iconUrl: toPublicImageUrl(t.images?.icon), maxLevel: t.levels.length };
  };

  const [leagueModal, setLeagueModal] = useState<HomeLeagueData | null>(null);

  const getHomeLeagueData = (name: string): HomeLeagueData | null => {
    const refinedName = name.replace(" League", "");
    const t = (_leagues.leagues() as any).byName(refinedName).data?.[0];
    if (!t) return null;

    // Loot is per-TH — require at build time so it's always fresh
    let loot: HomeLeagueLoot | null = null;
    try {
      const raw = require("clash-of-clans-data/data/ranked-battles/ranked-battles.json") as {
        lootByTownHall: Record<string, Array<{ leagueId: string; maxAvailableLoot: { goldAndElixir: number | null; darkElixir: number | null }; maxLeagueBonus: { goldAndElixir: number | null; darkElixir: number | null }; starBonus: { goldAndElixir: number | null; darkElixir: number | null; shinyOre: number | null; glowyOre: number | null; starryOre: number | null } }>>;
      };
      const entry = raw.lootByTownHall[String(thLevel)]?.find((l) => l.leagueId === t.id);
      if (entry) {
        loot = {
          maxAvailableLoot: entry.maxAvailableLoot,
          maxLeagueBonus: entry.maxLeagueBonus,
          starBonus: entry.starBonus,
        };
      }
    } catch { /* ignore */ }

    return {
      type: "home",
      name: t.name,
      image: t.image,
      attacksPerWeek: t.attacksPerWeek ?? null,
      percentPromoted: t.percentPromoted ?? null,
      percentDemoted: t.percentDemoted ?? null,
      loot,
    };
  };

  const homeLeague = hv.leagueName ? getHomeLeagueData(hv.leagueName) : null;

  const sumInstanceField = (buildingId: string, field: "capacity" | "productionRate") => {
    const building = _rbMap.get(buildingId);
    if (!building) return 0;
    const instances = hv.resourceBuildings[buildingId] ?? [];
    return instances.reduce((sum, inst) => {
      if (inst.level === 0) return sum;
      const lvl = building.levels.find((l) => l.level === inst.level && (l as any).townHallRequired <= thLevel);
      return sum + (lvl?.[field] ?? 0);
    }, 0);
  };

  const goldProduction = sumInstanceField("gold-mine", "productionRate");
  const elixirProduction = sumInstanceField("elixir-collector", "productionRate");
  const deProduction = sumInstanceField("dark-elixir-drill", "productionRate");
  const thStorageCapacity = _thLevels.find((l) => l.level === thLevel)?.storageCapacity;
  const goldStorage = sumInstanceField("gold-storage", "capacity") + (thStorageCapacity?.gold ?? 0);
  const elixirStorage = sumInstanceField("elixir-storage", "capacity") + (thStorageCapacity?.elixir ?? 0);
  const deStorage = sumInstanceField("dark-elixir-storage", "capacity") + (thStorageCapacity?.darkElixir ?? 0);

  const hasResourceData = goldStorage > 0 || elixirStorage > 0 || deStorage > 0;

  return (
    <section className="mb-8">
      <LeagueRewardsModal league={leagueModal} onClose={() => setLeagueModal(null)} />

      <div className="mb-3 flex items-center gap-3 rounded-xl border border-secondary/80 bg-primary px-4 py-3">
        <div className="relative h-10 w-10 shrink-0">
          <Image src={thImageUrl} alt={`TH${thLevel}`} fill sizes="40px" className="object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-extrabold text-white leading-tight">Home Village</h2>
          <div className="text-xs text-white/80">
            Town Hall {thLevel}
          </div>
        </div>
        {hasResourceData && (
          <div className="shrink-0 flex gap-2">
            <div className="flex flex-col gap-0.5">
              {goldProduction > 0 && (
                <div className="flex items-center gap-1">
                  <div className="relative h-3.5 w-3.5 shrink-0">
                    <Image src="/images/other/gold.png" alt="Gold" fill sizes="14px" className="object-contain" />
                  </div>
                  <span className="text-[10px] text-white/80">{goldProduction.toLocaleString()}/h</span>
                </div>
              )}
              {elixirProduction > 0 && (
                <div className="flex items-center gap-1">
                  <div className="relative h-3.5 w-3.5 shrink-0">
                    <Image src="/images/other/elixir.png" alt="Elixir" fill sizes="14px" className="object-contain" />
                  </div>
                  <span className="text-[10px] text-white/80">{elixirProduction.toLocaleString()}/h</span>
                </div>
              )}
              {deProduction > 0 && (
                <div className="flex items-center gap-1">
                  <div className="relative h-3.5 w-3.5 shrink-0">
                    <Image src="/images/other/dark-elixir.png" alt="Dark Elixir" fill sizes="14px" className="object-contain" />
                  </div>
                  <span className="text-[10px] text-white/80">{deProduction.toLocaleString()}/h</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              {goldStorage > 0 && (
                <div className="flex items-center gap-1">
                  <div className="relative h-3.5 w-3.5 shrink-0">
                    <Image src="/images/other/gold.png" alt="Gold" fill sizes="14px" className="object-contain" />
                  </div>
                  <span className="text-[10px] font-bold text-white/80">{goldStorage.toLocaleString()}</span>
                </div>
              )}
              {elixirStorage > 0 && (
                <div className="flex items-center gap-1">
                  <div className="relative h-3.5 w-3.5 shrink-0">
                    <Image src="/images/other/elixir.png" alt="Elixir" fill sizes="14px" className="object-contain" />
                  </div>
                  <span className="text-[10px] font-bold text-white/80">{elixirStorage.toLocaleString()}</span>
                </div>
              )}
              {deStorage > 0 && (
                <div className="flex items-center gap-1">
                  <div className="relative h-3.5 w-3.5 shrink-0">
                    <Image src="/images/other/dark-elixir.png" alt="Dark Elixir" fill sizes="14px" className="object-contain" />
                  </div>
                  <span className="text-[10px] font-bold text-white/80">{deStorage.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
        {homeLeague && (
          <button
            type="button"
            onClick={() => setLeagueModal(homeLeague)}
            className="shrink-0 flex flex-col items-center gap-0.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="relative h-10 w-10">
              <Image src={toPublicImageUrl(homeLeague.image)} alt={homeLeague.name} fill sizes="40px" className="object-contain" />
            </div>
            <div className="text-[10px] font-bold text-white/80 text-center leading-tight">{homeLeague.name}</div>
          </button>
        )}
        {days > 0 && (
          <div className="shrink-0 text-right">
            <div className="text-xl font-extrabold leading-none text-accent">{days}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/80">Days at TH{thLevel}</div>
          </div>
        )}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {structuresProg.max > 0 && (
          <ProgressCard label="Structures" result={structuresProg} sub="Defenses · Army · Resource" queueHref="/upgrade/home/builder/queue" />
        )}
        {trapsProg.max > 0 && (
          <ProgressCard label="Traps" result={trapsProg} queueHref="/upgrade/home/builder/queue" />
        )}
        {superchargeProg.max > 0 && (
          <ProgressCard label="Supercharge" result={superchargeProg} queueHref="/upgrade/home/builder/queue" />
        )}
        {craftedProg.max > 0 && (
          <ProgressCard label="Crafted Defenses" result={craftedProg} queueHref="/upgrade/home/builder/queue" />
        )}
        {labProg.max > 0 && (
          <ProgressCard label="Lab" result={labProg} sub="Troops · Spells · Siege" queueHref="/upgrade/home/research/queue" />
        )}
        {heroesProg.max > 0 && (
          <ProgressCard label="Heroes" result={heroesProg} queueHref="/upgrade/home/builder/queue" />
        )}
        {equipProg.max > 0 && (
          <ProgressCard label="Equipment" result={equipProg} queueHref="/upgrade/home/equipment" />
        )}
        {petsProg.max > 0 && (
          <ProgressCard label="Pets" result={petsProg} queueHref="/upgrade/home/pets/queue" />
        )}
        {wallsProg.max > 0 && (
          <ProgressCard label="Walls" result={wallsProg} sub={wallSub} queueHref="/upgrade/home/walls" />
        )}
      </div>

      {(() => {
        const regularTroops = hv.troops
          .filter((t) => regularTroopNames.has(t.name.toLowerCase()))
          .sort((a, b) => (_troopSortOrder.get(a.name.toLowerCase()) ?? 0) - (_troopSortOrder.get(b.name.toLowerCase()) ?? 0));
        return (regularTroops.length > 0 || hv.spells.length > 0) && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {regularTroops.length > 0 && (
              <SectionCard title="Troops" queueHref="/upgrade/home/research/queue">
                <ItemGrid items={regularTroops} getItemData={getTroopData} />
              </SectionCard>
            )}
            {hv.spells.length > 0 && (
              <SectionCard title="Spells" queueHref="/upgrade/home/research/queue">
                <ItemGrid items={hv.spells} getItemData={getSpellData} />
              </SectionCard>
            )}
          </div>
        );
      })()}

      {(hv.heroes.length > 0 || hv.siegeMachines.length > 0 || hv.pets.length > 0) && (
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {hv.heroes.length > 0 && (
            <SectionCard title="Heroes" queueHref="/upgrade/home/builder/queue">
              <div className="flex flex-wrap gap-2">
                {hv.heroes.map((hero) => {
                  const d = getHeroData(hero.name.toLowerCase());
                  return (
                    <HeroCard
                      key={hero.name}
                      hero={hero}
                      heroIconUrl={d?.iconUrl ?? ""}
                      maxHeroLevel={d?.maxLevel ?? 0}
                      getEquipmentData={getEquipData}
                    />
                  );
                })}
              </div>
            </SectionCard>
          )}

          {(hv.siegeMachines.length > 0 || hv.pets.length > 0) && (
            <div className="flex flex-col gap-3">
              {hv.pets.length > 0 && (
                <SectionCard title="Pets" queueHref="/upgrade/home/pets/queue">
                  <ItemGrid items={hv.pets} getItemData={getPetData} small />
                </SectionCard>
              )}
              {hv.siegeMachines.length > 0 && (
                <SectionCard title="Siege Machines" queueHref="/upgrade/home/research/queue">
                  <ItemGrid items={hv.siegeMachines} getItemData={getSiegeData} small />
                </SectionCard>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
