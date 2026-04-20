import type { HomeVillageData } from "@/types/app/game";
import type { HelperAssignment, HelperAssignmentTarget } from "@/types/app/playthrough";
import {
  adjustBuildingUpgrade,
  adjustHeroUpgrade,
  adjustResearchUpgrade,
  adjustPetUpgrade,
} from "@/lib/utils/upgradeActions";
import { calculators } from "clash-of-clans-data";
import type { AlchemistLevel } from "clash-of-clans-data";

import buildersApprenticeJson from "clash-of-clans-data/data/home/other/helpers/builders-apprentice.json";
import labAssistantJson from "clash-of-clans-data/data/home/other/helpers/lab-assistant.json";
import alchemistJson from "clash-of-clans-data/data/home/other/helpers/alchemist.json";
import prospectorJson from "clash-of-clans-data/data/home/other/helpers/prospector.json";

export const getBuildersApprenticeData = () => buildersApprenticeJson.levels as Array<{ level: number; workRate: number; upgradeCost: number; townHallRequired: number }>;
export const getLabAssistantData = () => labAssistantJson.levels as Array<{ level: number; workRate: number; upgradeCost: number; townHallRequired: number }>;
export const getAlchemistData = () => alchemistJson.levels as Array<{ level: number; goldElixirConversionMax: number; darkElixirConversionMax: number; conversionBonusPercent: number; upgradeCost: number; townHallRequired: number }>;
export const getProspectorData = () => prospectorJson.levels[0] as { level: number; shinyOreConversionMax: number; glowyOreConversionMax: number; starryOreConversionMax: number };

export const getBuildersApprenticeMinTH = () => buildersApprenticeJson.townHallRequired as number;
export const getLabAssistantMinTH = () => labAssistantJson.townHallRequired as number;
export const getAlchemistMinTH = () => alchemistJson.townHallRequired as number;
export const getProspectorMinTH = () => prospectorJson.townHallRequired as number;

// workRate = hours of progress completed per 60 min of real time. Clamped to remaining.
export const getHelperReduction = (workRate: number, remainingMs: number): number =>
  Math.min(workRate * 3_600_000, remainingMs);

export type AlchemistResourceType = "gold" | "elixir" | "darkElixir";
export type OreType = "shiny" | "glowy" | "starry";

// 150 Gold/Elixir = 1 Dark Elixir (consistent across all levels when checking max ratios)
const ALCHEMIST_RATES: Record<AlchemistResourceType, Record<AlchemistResourceType, number>> = {
  gold:       { gold: 0,    elixir: 1,     darkElixir: 1 / 150 },
  elixir:     { gold: 1,    elixir: 0,     darkElixir: 1 / 150 },
  darkElixir: { gold: 150,  elixir: 150,   darkElixir: 0       },
};

// 10 Shiny = 1 Glowy, 100 Glowy = 1 Starry → 1 Starry = 1000 Shiny
const ORE_RATES: Record<OreType, Record<OreType, number>> = {
  shiny:  { shiny: 0,     glowy: 1 / 10,   starry: 1 / 1000 },
  glowy:  { shiny: 10,    glowy: 0,         starry: 1 / 100  },
  starry: { shiny: 1000,  glowy: 100,       starry: 0        },
};

export const getAlchemistInputMax = (from: AlchemistResourceType, level: number): number => {
  const data = getAlchemistData();
  const levelData = data.find((l) => l.level === level) ?? data[0];
  return from === "darkElixir" ? levelData.darkElixirConversionMax : levelData.goldElixirConversionMax;
};

export const calcAlchemistConversion = (
  inputAmount: number,
  from: AlchemistResourceType,
  to: AlchemistResourceType,
  level: number
): number => {
  if (from === to) return 0;
  // Package calculator handles gold/elixir → DE with bonus and cap
  if ((from === "gold" || from === "elixir") && to === "darkElixir") {
    return calculators().helpers().alchemist(inputAmount, level as AlchemistLevel).total;
  }
  // Other directions (DE→gold, DE→elixir, gold→elixir, elixir→gold) use rate table
  const data = getAlchemistData();
  const levelData = data.find((l) => l.level === level) ?? data[0];
  const rate = ALCHEMIST_RATES[from][to];
  const baseOutput = Math.floor(inputAmount * rate);
  return Math.floor(baseOutput * (1 + levelData.conversionBonusPercent / 100));
};

export const getProspectorInputMax = (from: OreType): number => {
  const data = getProspectorData();
  return from === "shiny" ? data.shinyOreConversionMax
    : from === "glowy" ? data.glowyOreConversionMax
    : data.starryOreConversionMax;
};

export const calcProspectorConversion = (inputAmount: number, from: OreType, to: OreType): number => {
  if (from === to) return 0;
  return Math.floor(inputAmount * ORE_RATES[from][to]);
};

export interface ActiveUpgradeOption {
  label: string;
  target: HelperAssignmentTarget;
  finishesAt: string;
}

const isActive = (finishesAt: string | undefined): finishesAt is string =>
  !!finishesAt && new Date(finishesAt).getTime() > Date.now();

const formatBuildingLabel = (buildingId: string, instanceIndex: number, level: number): string => {
  const name = buildingId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return `${name} #${instanceIndex + 1} → ${level + 1}`;
};

export const getActiveBuilderUpgrades = (hv: HomeVillageData): ActiveUpgradeOption[] => {
  const results: ActiveUpgradeOption[] = [];
  const recordKeys = ["defenses", "armyBuildings", "resourceBuildings", "traps"] as const;

  for (const recordKey of recordKeys) {
    const record = hv[recordKey];
    for (const [buildingId, instances] of Object.entries(record)) {
      instances.forEach((inst, instanceIndex) => {
        if (isActive(inst.upgrade?.finishesAt)) {
          results.push({
            label: formatBuildingLabel(buildingId, instanceIndex, inst.level),
            target: { type: "building", recordKey, buildingId, instanceIndex },
            finishesAt: inst.upgrade!.finishesAt,
          });
        }
      });
    }
  }

  for (const hero of hv.heroes) {
    if (isActive(hero.upgrade?.finishesAt)) {
      results.push({
        label: `${hero.name} → ${hero.level + 1}`,
        target: { type: "hero", name: hero.name },
        finishesAt: hero.upgrade!.finishesAt,
      });
    }
  }

  if (isActive(hv.townHallUpgrade?.finishesAt)) {
    results.push({
      label: `Town Hall → ${hv.townHallLevel + 1}`,
      target: { type: "building", recordKey: "defenses", buildingId: "town-hall", instanceIndex: 0 },
      finishesAt: hv.townHallUpgrade!.finishesAt,
    });
  }

  return results;
};

export const getActiveResearchUpgrades = (hv: HomeVillageData): ActiveUpgradeOption[] => {
  const results: ActiveUpgradeOption[] = [];
  const researchKeys = ["troops", "spells", "siegeMachines"] as const;

  for (const researchKey of researchKeys) {
    for (const item of hv[researchKey]) {
      if (isActive(item.upgrade?.finishesAt)) {
        results.push({
          label: `${item.name} → ${item.level + 1}`,
          target: { type: "research", researchKey, name: item.name },
          finishesAt: item.upgrade!.finishesAt,
        });
      }
    }
  }

  return results;
};

export const resolveAssignmentFinishesAt = (hv: HomeVillageData, target: HelperAssignmentTarget): string | null => {
  if (target.type === "building") {
    if (target.buildingId === "town-hall") return hv.townHallUpgrade?.finishesAt ?? null;
    const inst = hv[target.recordKey]?.[target.buildingId]?.[target.instanceIndex];
    return inst?.upgrade?.finishesAt ?? null;
  }
  if (target.type === "hero") {
    const hero = hv.heroes.find((h) => h.name === target.name);
    return hero?.upgrade?.finishesAt ?? null;
  }
  if (target.type === "research") {
    const item = hv[target.researchKey]?.find((i) => i.name === target.name);
    return item?.upgrade?.finishesAt ?? null;
  }
  if (target.type === "pet") {
    const pet = hv.pets.find((p) => p.name === target.name);
    return (pet as any)?.upgrade?.finishesAt ?? null;
  }
  return null;
};

export const applyHelperReduction = (
  hv: HomeVillageData,
  assignment: HelperAssignment,
  savedMs: number
): HomeVillageData => {
  const { target } = assignment;
  const currentFinishesAt = resolveAssignmentFinishesAt(hv, target);
  if (!currentFinishesAt) return hv;

  const newFinishesAt = new Date(
    Math.max(Date.now(), new Date(currentFinishesAt).getTime() - savedMs)
  ).toISOString();

  if (target.type === "building") {
    if (target.buildingId === "town-hall") {
      if (!hv.townHallUpgrade) return hv;
      return { ...hv, townHallUpgrade: { ...hv.townHallUpgrade, finishesAt: newFinishesAt } };
    }
    return adjustBuildingUpgrade(hv, target.recordKey, target.buildingId, target.instanceIndex, newFinishesAt);
  }
  if (target.type === "hero") {
    return adjustHeroUpgrade(hv, target.name, newFinishesAt);
  }
  if (target.type === "research") {
    return adjustResearchUpgrade(hv, target.researchKey, target.name, newFinishesAt);
  }
  if (target.type === "pet") {
    return adjustPetUpgrade(hv, target.name, newFinishesAt);
  }
  return hv;
};
