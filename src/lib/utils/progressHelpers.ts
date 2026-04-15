/**
 * Progress calculation helpers for the dashboard.
 * All functions return { current, max, pct } where pct is 0–100.
 *
 * Max values come directly from the clash-of-clans-data package via
 * levelCountAtTownHall / levelCountAtBuilderHall — no manual building
 * iteration needed for the max side.
 */

import { home, builder } from "clash-of-clans-data";
import type { BuilderBaseData, HomeVillageData, TrackedHero, TrackedItem } from "@/types/app/game";

export interface ProgressResult {
  current: number;
  max: number;
  pct: number;
}

// Module-level singletons — package data is static, init once.
// Cast to any: levelCountAtTownHall/levelCountAtBuilderHall exist at runtime
// but are missing from the package's TypeScript type declarations.
const _home = home() as any;
const _builder = builder() as any;

// Regular (non-super) home troop names — used to filter super troop variants
export const regularTroopNames = new Set(
  (_home.troops().get() as Array<{ name: string }>).map((t) => t.name.toLowerCase())
);

function toResult(current: number, max: number): ProgressResult {
  if (max <= 0) return { current, max, pct: 0 };
  if (current >= max) return { current, max, pct: 100 };
  return { current, max, pct: Math.floor((current / max) * 100) };
}

function sumBuildingLevels(record: Record<string, Array<{ level: number }>>): number {
  let total = 0;
  for (const instances of Object.values(record)) {
    for (const inst of instances) total += inst.level;
  }
  return total;
}

// ── Structures ────────────────────────────────────────────────────────────────

export function calcHomeStructuresProgress(hv: HomeVillageData, thLevel: number): ProgressResult {
  const max = _home.levelCountAtTownHall(thLevel).structures;
  const current =
    sumBuildingLevels(hv.defenses) +
    sumBuildingLevels(hv.armyBuildings) +
    sumBuildingLevels(hv.resourceBuildings);
  return toResult(current, max);
}

export function calcHomeTrapsProgress(hv: HomeVillageData, thLevel: number): ProgressResult {
  const max = _home.levelCountAtTownHall(thLevel).traps;
  return toResult(sumBuildingLevels(hv.traps), max);
}

export function calcBuilderStructuresProgress(bb: BuilderBaseData, bhLevel: number): ProgressResult {
  const max = _builder.levelCountAtBuilderHall(bhLevel).structures;
  const current =
    sumBuildingLevels(bb.defenses) +
    sumBuildingLevels(bb.armyBuildings) +
    sumBuildingLevels(bb.resourceBuildings);
  return toResult(current, max);
}

export function calcBuilderTrapsProgress(bb: BuilderBaseData, bhLevel: number): ProgressResult {
  const max = _builder.levelCountAtBuilderHall(bhLevel).traps;
  return toResult(sumBuildingLevels(bb.traps), max);
}

// ── Lab ───────────────────────────────────────────────────────────────────────

export function calcHomeLabProgress(hv: HomeVillageData, thLevel: number): ProgressResult {
  const max = _home.levelCountAtTownHall(thLevel).lab;
  const regularTroops = hv.troops.filter((t) => regularTroopNames.has(t.name.toLowerCase()));
  const current =
    regularTroops.reduce((s, t) => s + t.level, 0) +
    hv.spells.reduce((s, t) => s + t.level, 0) +
    hv.siegeMachines.reduce((s, t) => s + t.level, 0);
  return toResult(current, max);
}

export function calcBuilderLabProgress(bb: BuilderBaseData, bhLevel: number): ProgressResult {
  const max = _builder.levelCountAtBuilderHall(bhLevel).starLab;
  return toResult(bb.troops.reduce((s, t) => s + t.level, 0), max);
}

// ── Heroes ────────────────────────────────────────────────────────────────────

export function calcHomeHeroesProgress(heroes: TrackedHero[], thLevel: number): ProgressResult {
  const max = _home.levelCountAtTownHall(thLevel).heroes;
  return toResult(heroes.reduce((s, h) => s + h.level, 0), max);
}

export function calcBuilderHeroesProgress(heroes: TrackedHero[], bhLevel: number): ProgressResult {
  const max = _builder.levelCountAtBuilderHall(bhLevel).heroes;
  return toResult(heroes.reduce((s, h) => s + h.level, 0), max);
}

// ── Equipment ─────────────────────────────────────────────────────────────────

export function calcEquipmentProgress(heroes: TrackedHero[]): ProgressResult {
  const allEquipment = heroes.flatMap((h) => h.equipment);
  const equipData = _home.heroEquipment().get() as Array<{ name: string; levels: unknown[] }>;
  let current = 0;
  let max = 0;
  for (const eq of allEquipment) {
    const d = equipData.find((e) => e.name.toLowerCase() === eq.name.toLowerCase());
    if (!d) continue;
    current += eq.level;
    max += d.levels.length;
  }
  return toResult(current, max);
}

// ── Pets ──────────────────────────────────────────────────────────────────────

export function calcPetsProgress(pets: TrackedItem[], thLevel: number): ProgressResult {
  const max = _home.levelCountAtTownHall(thLevel).pets;
  return toResult(pets.reduce((s, p) => s + p.level, 0), max);
}

// ── Walls ─────────────────────────────────────────────────────────────────────

export function calcWallsProgress(walls: Record<string, number>, thLevel: number): ProgressResult {
  const max = _home.levelCountAtTownHall(thLevel).walls;
  let current = 0;
  for (const [levelStr, count] of Object.entries(walls)) {
    current += parseInt(levelStr, 10) * count;
  }
  return toResult(current, max);
}

export function calcBuilderWallsProgress(walls: Record<string, number>, bhLevel: number): ProgressResult {
  const max = _builder.levelCountAtBuilderHall(bhLevel).walls;
  let current = 0;
  for (const [levelStr, count] of Object.entries(walls)) {
    current += parseInt(levelStr, 10) * count;
  }
  return toResult(current, max);
}

/** Wall count and max level at TH — used for the progress card sub-label. */
export function getHomeWallData(thLevel: number): { maxLevel: number; totalAtTH: number } {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const wallData = require("clash-of-clans-data/data/home/walls/wall.json") as {
      levels: Array<{ level: number; townHallRequired: number }>;
      availablePerTownHall: Array<{ townHallLevel: number; count: number }>;
    };
    const eligible = wallData.levels.filter((l) => l.townHallRequired <= thLevel);
    const maxLevel = eligible.length > 0 ? eligible[eligible.length - 1].level : 1;
    let totalAtTH = 0;
    for (const entry of wallData.availablePerTownHall) {
      if (entry.townHallLevel <= thLevel) totalAtTH = entry.count;
    }
    return { maxLevel, totalAtTH };
  } catch {
    return { maxLevel: 17, totalAtTH: 300 };
  }
}

/** Wall count and max level at BH — used for the progress card sub-label. */
export function getBuilderWallData(bhLevel: number): { maxLevel: number; totalAtBH: number } {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const wallData = require("clash-of-clans-data/data/builder/walls/wall.json") as {
      levels: Array<{ level: number; builderHallRequired?: number }>;
      availablePerBuilderHall: Array<{ builderHallLevel: number; count: number }>;
    };
    const eligible = wallData.levels.filter((l) => (l.builderHallRequired ?? 0) <= bhLevel);
    const maxLevel = eligible.length > 0 ? eligible[eligible.length - 1].level : 9;
    let totalAtBH = 0;
    for (const entry of wallData.availablePerBuilderHall) {
      if (entry.builderHallLevel <= bhLevel) totalAtBH = entry.count;
    }
    return { maxLevel, totalAtBH };
  } catch {
    return { maxLevel: 9, totalAtBH: 100 };
  }
}

// ── Hero Hall ─────────────────────────────────────────────────────────────────

/** Max Hero Hall level achievable at the given TH level — gates per-hero max levels. */
export function getMaxHeroHallLevel(thLevel: number): number {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const raw = require("clash-of-clans-data/data/home/army-buildings/hero-hall.json") as {
      levels: Array<{ level: number; townHallRequired?: number }>;
    };
    return raw.levels.filter((l) => (l.townHallRequired ?? 0) <= thLevel).length;
  } catch {
    return 0;
  }
}

// ── Crafted Defenses ─────────────────────────────────────────────────────────

export function calcCraftedDefensesProgress(hv: HomeVillageData): ProgressResult {
  type RawCraftedDefense = { id: string; modules: Array<{ upgrades: unknown[] }> };
  const crafted = (_home.craftedDefenses().current().get() as RawCraftedDefense[]);

  let max = 0;
  let current = 0;

  for (const defense of crafted) {
    const moduleMaxLevels = defense.modules.map((m) => m.upgrades.length);
    max += moduleMaxLevels.reduce((s, l) => s + l, 0);

    const tracked = hv.craftedDefenses[defense.id];
    current += tracked ? tracked.modules[0] + tracked.modules[1] + tracked.modules[2] : 0;
  }

  return toResult(current, max);
}

// ── Supercharge ───────────────────────────────────────────────────────────────

type RawBuildingData = {
  id: string;
  levels: Array<{ supercharge?: boolean; townHallRequired: number }>;
  availablePerTownHall: Array<{ townHallLevel: number; count: number }>;
};

function getCountAtTH(
  availablePerTownHall: Array<{ townHallLevel: number; count: number }>,
  thLevel: number
): number {
  let count = 0;
  for (const entry of availablePerTownHall) {
    if (entry.townHallLevel <= thLevel) count = entry.count;
  }
  return count;
}

export function calcSuperchargeProgress(hv: HomeVillageData, thLevel: number): ProgressResult {
  const defenseData = _home.defenses().get() as RawBuildingData[];
  const resourceData = _home.resourceBuildings().get() as RawBuildingData[];

  let max = 0;
  let current = 0;

  for (const building of [...defenseData, ...resourceData]) {
    const tiers = building.levels.filter(
      (l) => l.supercharge === true && l.townHallRequired <= thLevel
    ).length;
    if (tiers === 0) continue;

    const instanceCount = getCountAtTH(building.availablePerTownHall, thLevel);
    max += instanceCount * tiers;

    const tracked = hv.defenses[building.id] ?? hv.resourceBuildings[building.id] ?? [];
    current += tracked.reduce((s, inst) => s + (inst.superchargeLevel ?? 0), 0);
  }

  return toResult(current, max);
}

// ── Achievements ──────────────────────────────────────────────────────────────

export function calcAchievementsProgress(achievements: Array<{ stars: number }>): ProgressResult {
  const current = achievements.reduce((sum, a) => sum + a.stars, 0);
  const max = achievements.length * 3;
  return toResult(current, max);
}

// ── Days counter ──────────────────────────────────────────────────────────────

export function calcDaysAt(changedAt: string | undefined): number {
  if (!changedAt) return 0;
  const ms = Date.now() - new Date(changedAt).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}
