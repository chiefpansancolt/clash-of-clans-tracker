/**
 * Pure data helpers for the Clan Capital Mass Edit page.
 * No React imports — safe to call from useMemo or module scope.
 */

import { clanCapital } from "clash-of-clans-data";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import type { BuildingEditData, ItemEditData, WallLevelData } from "./massEditHelpers";

// Module-level singleton
const _cap = clanCapital() as any;


// ── Private types ─────────────────────────────────────────────────────────────

type RawCapBuilding = {
  id: string;
  name: string;
  levels: Array<{
    level: number;
    capitalHallRequired?: number;
    districtHallRequired?: number;
    images?: { normal?: string };
  }>;
  availablePerCapitalHall?: Array<{ capitalHallLevel: number; count: number }>;
  availablePerDistrict?: Array<{ district: string; countPerDistrictHall: number[] }>;
};

// ── Private helpers ───────────────────────────────────────────────────────────

function countAtCapitalHall(
  availablePerCapitalHall: Array<{ capitalHallLevel: number; count: number }>,
  capitalHallLevel: number
): number {
  let count = 0;
  for (const entry of availablePerCapitalHall) {
    if (entry.capitalHallLevel <= capitalHallLevel) count = entry.count;
  }
  return count;
}

function countAtDistrictHall(
  availablePerDistrict: Array<{ district: string; countPerDistrictHall: number[] }>,
  districtId: string,
  dhLevel: number
): number {
  const entry = availablePerDistrict.find((d) => d.district === districtId);
  if (!entry) return 0;
  // countPerDistrictHall is 0-indexed: index 0 = DH level 1
  return entry.countPerDistrictHall[dhLevel - 1] ?? 0;
}

// ── Capital Peak buildings ────────────────────────────────────────────────────

export function getCapitalPeakBuildings(capitalHallLevel: number): BuildingEditData[] {
  const raw = _cap.defenses().get() as RawCapBuilding[];
  const result: BuildingEditData[] = [];

  for (const b of raw) {
    if (!b.availablePerCapitalHall?.length) continue;
    const instanceCount = countAtCapitalHall(b.availablePerCapitalHall, capitalHallLevel);
    if (instanceCount === 0) continue;
    const eligibleLevels = b.levels.filter(
      (l) => (l.capitalHallRequired ?? 0) <= capitalHallLevel
    );
    const maxLevel = eligibleLevels.length;
    if (maxLevel === 0) continue;
    const imageUrl = eligibleLevels[maxLevel - 1]?.images?.normal
      ? toPublicImageUrl(eligibleLevels[maxLevel - 1].images!.normal!)
      : "";
    result.push({ id: b.id, name: b.name, maxLevel, instanceCount, imageUrl, superchargeTiers: 0 });
  }

  return result;
}

// ── District buildings ────────────────────────────────────────────────────────

export function getDistrictBuildings(districtId: string, dhLevel: number): BuildingEditData[] {
  if (dhLevel === 0) return [];
  const raw = _cap.defenses().get() as RawCapBuilding[];
  const result: BuildingEditData[] = [];

  for (const b of raw) {
    if (!b.availablePerDistrict?.length) continue;
    const instanceCount = countAtDistrictHall(b.availablePerDistrict, districtId, dhLevel);
    if (instanceCount === 0) continue;
    const eligibleLevels = b.levels.filter(
      (l) => (l.districtHallRequired ?? 0) <= dhLevel
    );
    const maxLevel = eligibleLevels.length;
    if (maxLevel === 0) continue;
    const imageUrl = eligibleLevels[maxLevel - 1]?.images?.normal
      ? toPublicImageUrl(eligibleLevels[maxLevel - 1].images!.normal!)
      : "";
    result.push({ id: b.id, name: b.name, maxLevel, instanceCount, imageUrl, superchargeTiers: 0 });
  }

  return result;
}

// ── Capital Peak traps ────────────────────────────────────────────────────────

export function getCapitalPeakTraps(capitalHallLevel: number): BuildingEditData[] {
  if (capitalHallLevel === 0) return [];
  const raw = _cap.traps().get() as RawCapBuilding[];
  const result: BuildingEditData[] = [];

  for (const b of raw) {
    if (!b.availablePerCapitalHall?.length) continue;
    const instanceCount = countAtCapitalHall(b.availablePerCapitalHall, capitalHallLevel);
    if (instanceCount === 0) continue;
    const eligibleLevels = b.levels.filter(
      (l) => (l.capitalHallRequired ?? 0) <= capitalHallLevel
    );
    const maxLevel = eligibleLevels.length;
    if (maxLevel === 0) continue;
    const imageUrl = eligibleLevels[maxLevel - 1]?.images?.normal
      ? toPublicImageUrl(eligibleLevels[maxLevel - 1].images!.normal!)
      : "";
    result.push({ id: b.id, name: b.name, maxLevel, instanceCount, imageUrl, superchargeTiers: 0 });
  }

  return result;
}

// ── District traps ────────────────────────────────────────────────────────────

export function getDistrictTraps(districtId: string, dhLevel: number): BuildingEditData[] {
  if (dhLevel === 0) return [];
  const raw = _cap.traps().get() as RawCapBuilding[];
  const result: BuildingEditData[] = [];

  for (const b of raw) {
    if (!b.availablePerDistrict?.length) continue;
    const instanceCount = countAtDistrictHall(b.availablePerDistrict, districtId, dhLevel);
    if (instanceCount === 0) continue;
    const eligibleLevels = b.levels.filter(
      (l) => (l.districtHallRequired ?? 0) <= dhLevel
    );
    const maxLevel = eligibleLevels.length;
    if (maxLevel === 0) continue;
    const imageUrl = eligibleLevels[maxLevel - 1]?.images?.normal
      ? toPublicImageUrl(eligibleLevels[maxLevel - 1].images!.normal!)
      : "";
    result.push({ id: b.id, name: b.name, maxLevel, instanceCount, imageUrl, superchargeTiers: 0 });
  }

  return result;
}

// ── District army buildings ───────────────────────────────────────────────────

/** Barracks, spell factories, and army camp per district. */
export function getDistrictArmyBuildings(districtId: string, dhLevel: number): BuildingEditData[] {
  if (dhLevel === 0) return [];
  const raw = _cap.armyBuildings().get() as RawCapBuilding[];
  const result: BuildingEditData[] = [];

  for (const b of raw) {
    if (!b.availablePerDistrict?.length) continue;
    const instanceCount = countAtDistrictHall(b.availablePerDistrict, districtId, dhLevel);
    if (instanceCount === 0) continue;
    const eligibleLevels = b.levels.filter(
      (l) => (l.districtHallRequired ?? 0) <= dhLevel
    );
    const maxLevel = eligibleLevels.length;
    if (maxLevel === 0) continue;
    const imageUrl = eligibleLevels[maxLevel - 1]?.images?.normal
      ? toPublicImageUrl(eligibleLevels[maxLevel - 1].images!.normal!)
      : "";
    result.push({ id: b.id, name: b.name, maxLevel, instanceCount, imageUrl, superchargeTiers: 0 });
  }

  return result;
}

// ── Max hall level helpers ────────────────────────────────────────────────────

/** Highest Capital Hall level present in building data. */
export function getMaxCapitalHallLevel(): number {
  const raw = _cap.defenses().get() as RawCapBuilding[];
  let max = 1;
  for (const b of raw) {
    if (!b.availablePerCapitalHall?.length) continue;
    for (const entry of b.availablePerCapitalHall) {
      max = Math.max(max, entry.capitalHallLevel);
    }
  }
  return max;
}

/** Highest District Hall level for a given district, derived from building data. */
export function getMaxDistrictHallLevel(districtId: string): number {
  const raw = _cap.defenses().get() as RawCapBuilding[];
  let max = 0;
  for (const b of raw) {
    if (!b.availablePerDistrict?.length) continue;
    const entry = b.availablePerDistrict.find((d) => d.district === districtId);
    if (entry) max = Math.max(max, entry.countPerDistrictHall.length);
  }
  return max || 5;
}

// ── Capital walls ─────────────────────────────────────────────────────────────

export interface CapitalWallInfo {
  maxLevel: number;
  totalCount: number;
  levels: WallLevelData[];
}

type RawWall = {
  levels: Array<{ level: number; capitalHallRequired?: number; districtHallRequired?: number; images?: { normal?: string } }>;
  availablePerCapitalHall?: Array<{ capitalHallLevel: number; count: number }>;
  availablePerDistrict?: Array<{ district: string; countPerDistrictHall: number[] }>;
};

function getWallData(): RawWall | null {
  const raw = _cap.walls().get() as RawWall[];
  return raw[0] ?? null;
}

export function getCapitalPeakWalls(capitalHallLevel: number): CapitalWallInfo {
  if (capitalHallLevel === 0) return { maxLevel: 0, totalCount: 0, levels: [] };
  const wall = getWallData();
  if (!wall) return { maxLevel: 0, totalCount: 0, levels: [] };
  const totalCount = countAtCapitalHall(wall.availablePerCapitalHall ?? [], capitalHallLevel);
  const eligible = wall.levels.filter((l) => (l.capitalHallRequired ?? 0) <= capitalHallLevel);
  return {
    maxLevel: eligible.length,
    totalCount,
    levels: eligible.map((l) => ({
      level: l.level,
      imageUrl: l.images?.normal ? toPublicImageUrl(l.images.normal) : "",
    })),
  };
}

export function getDistrictWalls(districtId: string, dhLevel: number): CapitalWallInfo {
  if (dhLevel === 0) return { maxLevel: 0, totalCount: 0, levels: [] };
  const wall = getWallData();
  if (!wall) return { maxLevel: 0, totalCount: 0, levels: [] };
  const totalCount = countAtDistrictHall(wall.availablePerDistrict ?? [], districtId, dhLevel);
  const eligible = wall.levels.filter((l) => (l.districtHallRequired ?? 0) <= dhLevel);
  return {
    maxLevel: eligible.length,
    totalCount,
    levels: eligible.map((l) => ({
      level: l.level,
      imageUrl: l.images?.normal ? toPublicImageUrl(l.images.normal) : "",
    })),
  };
}

// ── Capital troops ────────────────────────────────────────────────────────────

export function getCapitalTroops(): ItemEditData[] {
  type RawTroop = {
    name: string;
    levels: Array<{ level: number; districtHallRequired?: number }>;
    images?: { icon?: string };
  };
  const SKIP_TROOP_IDS = new Set(["hog-rider"]);
  const raw = (_cap.troops().get() as RawTroop[]).filter((t) => !SKIP_TROOP_IDS.has((t as any).id));
  return raw.map((t) => ({
    name: t.name,
    maxLevel: t.levels[t.levels.length - 1]?.level ?? t.levels.length,
    imageUrl: t.images?.icon ? toPublicImageUrl(t.images.icon) : "",
  }));
}

// ── Capital spells ────────────────────────────────────────────────────────────

export function getCapitalSpells(): ItemEditData[] {
  type RawSpell = {
    name: string;
    levels: Array<{ level: number; districtHallRequired?: number; images?: { normal?: string } }>;
  };
  const raw = _cap.spells().get() as RawSpell[];
  return raw.map((s) => ({
    name: s.name,
    maxLevel: s.levels[s.levels.length - 1]?.level ?? s.levels.length,
    // Spells have no top-level icon; use first level's normal image
    imageUrl: s.levels[0]?.images?.normal ? toPublicImageUrl(s.levels[0].images!.normal!) : "",
  }));
}
