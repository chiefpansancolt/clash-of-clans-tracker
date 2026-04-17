/**
 * Pure data helpers for the Builder Base Mass Edit page.
 * No React imports — safe to call from useMemo or module scope.
 *
 * All functions return typed descriptor objects that the page
 * components use to render slider rows and initialise state.
 */

import { builder } from "clash-of-clans-data";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { getBuilderWallData } from "@/lib/utils/progressHelpers";
import type {
  BuildingEditData,
  ItemEditData,
  HeroEditData,
  WallEditInfo,
  WallLevelData,
} from "./massEditHelpers";

// Module-level singleton — matches progressHelpers.ts pattern
const _builder = builder() as any;

function builderBuildingToEditData(
  b: { id: string; name: string; levels: Array<{ level: number; builderHallRequired?: number; images?: { normal?: string } }>; availablePerBuilderHall?: Array<{ builderHallLevel: number; count: number }> },
  bhLevel: number
): BuildingEditData | null {
  const nonSCLevels = b.levels.filter((l) => (l.builderHallRequired ?? 0) <= bhLevel);
  const maxLevel = nonSCLevels[nonSCLevels.length - 1]?.level ?? nonSCLevels.length;
  const instanceCount = getCountAtBH(b.availablePerBuilderHall ?? [], bhLevel);
  if (instanceCount === 0) return null;

  const imageUrl =
    nonSCLevels[maxLevel - 1]?.images?.normal
      ? toPublicImageUrl(nonSCLevels[maxLevel - 1].images!.normal!)
      : "";

  return { id: b.id, name: b.name, maxLevel, instanceCount, imageUrl, superchargeTiers: 0 };
}

export function getCountAtBH(
  availablePerBuilderHall: Array<{ builderHallLevel: number; count: number }>,
  bhLevel: number
): number {
  let count = 0;
  for (const entry of availablePerBuilderHall) {
    if (entry.builderHallLevel <= bhLevel) count = entry.count;
  }
  return count;
}

export function getBuilderDefensesAtBH(bhLevel: number): BuildingEditData[] {
  const raw = _builder.defenses().get() as Array<{
    id: string;
    name: string;
    levels: Array<{ level: number; builderHallRequired?: number; images?: { normal?: string } }>;
    availablePerBuilderHall?: Array<{ builderHallLevel: number; count: number }>;
  }>;
  return raw.flatMap((b) => {
    const d = builderBuildingToEditData(b, bhLevel);
    return d ? [d] : [];
  });
}

export function getBuilderArmyBuildingsAtBH(bhLevel: number): BuildingEditData[] {
  const raw = _builder.armyBuildings().get() as Array<{
    id: string;
    name: string;
    levels: Array<{ level: number; builderHallRequired?: number; images?: { normal?: string } }>;
    availablePerBuilderHall?: Array<{ builderHallLevel: number; count: number }>;
  }>;
  return raw.flatMap((b) => {
    const d = builderBuildingToEditData(b, bhLevel);
    return d ? [d] : [];
  });
}

export function getBuilderResourceBuildingsAtBH(bhLevel: number): BuildingEditData[] {
  const raw = _builder.resourceBuildings().get() as Array<{
    id: string;
    name: string;
    levels: Array<{ level: number; builderHallRequired?: number; images?: { normal?: string } }>;
    availablePerBuilderHall?: Array<{ builderHallLevel: number; count: number }>;
  }>;
  return raw.flatMap((b) => {
    const d = builderBuildingToEditData(b, bhLevel);
    return d ? [d] : [];
  });
}

export function getBuilderTrapsAtBH(bhLevel: number): BuildingEditData[] {
  const raw = _builder.traps().get() as Array<{
    id: string;
    name: string;
    levels: Array<{ level: number; builderHallRequired?: number; images?: { normal?: string } }>;
    availablePerBuilderHall?: Array<{ builderHallLevel: number; count: number }>;
  }>;
  return raw.flatMap((b) => {
    const d = builderBuildingToEditData(b, bhLevel);
    return d ? [d] : [];
  });
}

export function getBuilderTroopsAtBH(bhLevel: number): ItemEditData[] {
  type RawTroop = {
    name: string;
    levels: Array<{ level: number; starLabRequired?: number }>;
    images?: { icon?: string };
  };
  const raw = _builder.troops().get() as RawTroop[];
  return raw.flatMap((t) => {
    const eligible = t.levels.filter((l) => (l.starLabRequired ?? 0) <= bhLevel);
    if (eligible.length === 0) return [];
    const maxLevel = eligible[eligible.length - 1].level;
    const imageUrl = t.images?.icon ? toPublicImageUrl(t.images.icon) : "";
    return [{ name: t.name, maxLevel, imageUrl }];
  });
}

export function getBuilderHeroesAtBH(bhLevel: number): HeroEditData[] {
  type RawHero = {
    id: string;
    name: string;
    levels: Array<{ level: number; builderHallLevelRequired?: number }>;
    images?: { icon?: string };
  };
  const raw = _builder.heroes().get() as RawHero[];
  return raw.flatMap((h) => {
    const eligible = h.levels.filter(
      (l) => (l.builderHallLevelRequired ?? 0) <= bhLevel
    );
    if (eligible.length === 0) return [];
    const maxLevel = eligible[eligible.length - 1].level;
    const imageUrl = h.images?.icon ? toPublicImageUrl(h.images.icon) : "";
    return [{ id: h.id, name: h.name, maxLevel, imageUrl }];
  });
}

export function getBuilderWallLevelsAtBH(bhLevel: number): WallEditInfo {
  const { maxLevel, totalAtBH } = getBuilderWallData(bhLevel);
  try {
    const wallData = require("clash-of-clans-data/data/builder/walls/wall.json") as {
      levels: Array<{ level: number; builderHallRequired: number; images?: { normal?: string } }>;
    };
    const levels: WallLevelData[] = wallData.levels
      .filter((l) => l.builderHallRequired <= bhLevel)
      .map((l) => ({
        level: l.level,
        imageUrl: l.images?.normal ? toPublicImageUrl(l.images.normal) : "",
      }));
    return { levels, totalAtTH: totalAtBH, maxLevel };
  } catch {
    // Fallback: generate levels without images
    const levels: WallLevelData[] = Array.from({ length: maxLevel }, (_, i) => ({
      level: i + 1,
      imageUrl: "",
    }));
    return { levels, totalAtTH: totalAtBH, maxLevel };
  }
}
