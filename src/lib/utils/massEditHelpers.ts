/**
 * Pure data helpers for the Mass Edit pages.
 * No React imports — safe to call from useMemo or module scope.
 *
 * All functions return typed descriptor objects that the page
 * components use to render slider rows and initialise state.
 */

import { home } from "clash-of-clans-data";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { getCountAtTH, getHomeWallData, getMaxHeroHallLevel, regularTroopNames } from "@/lib/utils/progressHelpers";

// Module-level singleton — matches progressHelpers.ts pattern
const _home = home() as any;

// ── Shared raw types ──────────────────────────────────────────────────────────

type RawLevel = {
  level: number;
  townHallRequired?: number;
  supercharge?: boolean;
  images?: { normal?: string };
};

type RawBuilding = {
  id: string;
  name: string;
  levels: RawLevel[];
  availablePerTownHall: Array<{ townHallLevel: number; count: number }>;
};

// ── Exported descriptor types ─────────────────────────────────────────────────

export interface BuildingEditData {
  id: string;
  name: string;
  /** Number of non-supercharge levels unlocked at thLevel */
  maxLevel: number;
  /** Number of instances available at thLevel */
  instanceCount: number;
  /** Public URL of the max-level image */
  imageUrl: string;
  /** Number of supercharge tiers unlocked at thLevel (0 = not superchargeable) */
  superchargeTiers: number;
}

export interface ItemEditData {
  name: string;
  maxLevel: number;
  imageUrl: string;
}

export interface HeroEditData {
  id: string;
  name: string;
  maxLevel: number;
  imageUrl: string;
}

export interface EquipEditData {
  name: string;
  heroId: string;
  maxLevel: number;
  imageUrl: string;
}

export interface CraftedDefenseEditData {
  id: string;
  name: string;
  imageUrl: string;
  modules: Array<{ name: string; maxLevel: number }>;
}

export interface WallLevelData {
  level: number;
  imageUrl: string;
}

// ── Private helpers ───────────────────────────────────────────────────────────

function buildingToEditData(b: RawBuilding, thLevel: number): BuildingEditData | null {
  const nonSCLevels = b.levels.filter(
    (l) => !l.supercharge && (l.townHallRequired ?? 0) <= thLevel
  );
  const maxLevel = nonSCLevels[nonSCLevels.length - 1]?.level ?? nonSCLevels.length;
  const instanceCount = getCountAtTH(b.availablePerTownHall, thLevel);
  if (instanceCount === 0) return null;

  const superchargeTiers = b.levels.filter(
    (l) => l.supercharge === true && (l.townHallRequired ?? 0) <= thLevel
  ).length;

  const topLevel = nonSCLevels[nonSCLevels.length - 1];
  const imageUrl = topLevel?.images?.normal ? toPublicImageUrl(topLevel.images.normal) : "";

  return { id: b.id, name: b.name, maxLevel, instanceCount, imageUrl, superchargeTiers };
}

// ── Defenses ──────────────────────────────────────────────────────────────────

export function getDefensesAtTH(thLevel: number): BuildingEditData[] {
  const raw = _home.defenses().get() as RawBuilding[];
  return raw.flatMap((b) => {
    const d = buildingToEditData(b, thLevel);
    return d ? [d] : [];
  });
}

// ── Army buildings ────────────────────────────────────────────────────────────

const ARMY_BUILDING_FILES = [
  "army-camp",
  "barracks",
  "dark-barracks",
  "spell-factory",
  "dark-spell-factory",
  "workshop",
  "laboratory",
  "hero-hall",
  "pet-house",
  "blacksmith",
] as const;

export function getArmyBuildingsAtTH(thLevel: number): BuildingEditData[] {
  const result: BuildingEditData[] = [];
  for (const file of ARMY_BUILDING_FILES) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const b = require(`clash-of-clans-data/data/home/army-buildings/${file}.json`) as RawBuilding;
      const d = buildingToEditData(b, thLevel);
      if (d) result.push(d);
    } catch {
      // file missing in this version of the package — skip
    }
  }
  return result;
}

// ── Resource buildings ────────────────────────────────────────────────────────

export function getResourceBuildingsAtTH(thLevel: number): BuildingEditData[] {
  const raw = _home.resourceBuildings().get() as RawBuilding[];
  return raw.flatMap((b) => {
    const d = buildingToEditData(b, thLevel);
    return d ? [d] : [];
  });
}

// ── Traps ─────────────────────────────────────────────────────────────────────

export function getTrapsAtTH(thLevel: number): BuildingEditData[] {
  const raw = _home.traps().get() as RawBuilding[];
  return raw.flatMap((b) => {
    const d = buildingToEditData(b, thLevel);
    return d ? [d] : [];
  });
}

// ── Guardians ─────────────────────────────────────────────────────────────────

export function getGuardiansAtTH(thLevel: number): BuildingEditData[] {
  type RawGuardian = {
    id: string;
    name: string;
    availablePerTownHall: Array<{ townHallLevel: number; count: number }>;
    levels: Array<{ level: number; townHallRequired?: number; images?: { normal?: string } }>;
  };
  const raw = _home.guardians().get() as RawGuardian[];
  return raw.flatMap((g) => {
    const instanceCount = getCountAtTH(g.availablePerTownHall, thLevel);
    if (instanceCount === 0) return [];
    const eligible = g.levels.filter((l) => (l.townHallRequired ?? 0) <= thLevel);
    if (eligible.length === 0) return [];
    const maxLevel = (eligible[eligible.length - 1] as any).level ?? eligible.length;
    const topLevel = eligible[eligible.length - 1];
    const imageUrl = topLevel?.images?.normal ? toPublicImageUrl(topLevel.images.normal) : "";
    return [{ id: g.id, name: g.name, maxLevel, instanceCount, imageUrl, superchargeTiers: 0 }];
  });
}

// ── Troops ────────────────────────────────────────────────────────────────────

export function getTroopsAtTH(thLevel: number): ItemEditData[] {
  type RawTroop = {
    name: string;
    levels: Array<{ level: number; townHallRequired?: number }>;
    images?: { icon?: string };
  };
  const raw = _home.troops().get() as RawTroop[];
  return raw.flatMap((t) => {
    // Skip super-troops
    if (!regularTroopNames.has(t.name.toLowerCase())) return [];
    const eligible = t.levels.filter((l) => (l.townHallRequired ?? 0) <= thLevel);
    if (eligible.length === 0) return [];
    const maxLevel = eligible[eligible.length - 1].level;
    const imageUrl = t.images?.icon ? toPublicImageUrl(t.images.icon) : "";
    return [{ name: t.name, maxLevel, imageUrl }];
  });
}

// ── Spells ────────────────────────────────────────────────────────────────────

export function getSpellsAtTH(thLevel: number): ItemEditData[] {
  type RawSpell = {
    name: string;
    levels: Array<{ level: number; townHallRequired?: number }>;
    images?: { icon?: string };
  };
  const raw = _home.spells().get() as RawSpell[];
  return raw.flatMap((s) => {
    const eligible = s.levels.filter((l) => (l.townHallRequired ?? 0) <= thLevel);
    if (eligible.length === 0) return [];
    const maxLevel = eligible[eligible.length - 1].level;
    const imageUrl = s.images?.icon ? toPublicImageUrl(s.images.icon) : "";
    return [{ name: s.name, maxLevel, imageUrl }];
  });
}

// ── Siege machines ────────────────────────────────────────────────────────────

export function getSiegeMachinesAtTH(thLevel: number): ItemEditData[] {
  type RawSiege = {
    name: string;
    levels: Array<{ level: number; townHallRequired?: number }>;
    images?: { icon?: string };
  };
  const raw = _home.siegeMachines().get() as RawSiege[];
  return raw.flatMap((s) => {
    const eligible = s.levels.filter((l) => (l.townHallRequired ?? 0) <= thLevel);
    if (eligible.length === 0) return [];
    const maxLevel = eligible[eligible.length - 1].level;
    const imageUrl = s.images?.icon ? toPublicImageUrl(s.images.icon) : "";
    return [{ name: s.name, maxLevel, imageUrl }];
  });
}

// ── Pets ──────────────────────────────────────────────────────────────────────

export function getPetsAtTH(thLevel: number): ItemEditData[] {
  type RawPet = {
    name: string;
    levels: Array<{ level: number; townHallRequired?: number }>;
    images?: { icon?: string };
  };
  const raw = _home.pets().get() as RawPet[];
  return raw.flatMap((p) => {
    // Pet is available if its first level's townHallRequired <= thLevel
    if ((p.levels[0]?.townHallRequired ?? 0) > thLevel) return [];
    const imageUrl = p.images?.icon ? toPublicImageUrl(p.images.icon) : "";
    return [{ name: p.name, maxLevel: p.levels[p.levels.length - 1].level, imageUrl }];
  });
}

// ── Heroes ────────────────────────────────────────────────────────────────────

export function getHeroesAtTH(thLevel: number): HeroEditData[] {
  type RawHero = {
    id: string;
    name: string;
    levels: Array<{ heroHallLevelRequired?: number }>;
    images?: { icon?: string };
  };
  const heroHallLevel = getMaxHeroHallLevel(thLevel);
  const raw = _home.heroes().get() as RawHero[];
  return raw.flatMap((h) => {
    const eligible = h.levels.filter(
      (l) => (l.heroHallLevelRequired ?? 0) <= heroHallLevel
    );
    if (eligible.length === 0) return [];
    const maxLevel = (eligible[eligible.length - 1] as any).level ?? eligible.length;
    const imageUrl = h.images?.icon ? toPublicImageUrl(h.images.icon) : "";
    return [{ id: h.id, name: h.name, maxLevel, imageUrl }];
  });
}

// ── Hero equipment ────────────────────────────────────────────────────────────

export function getAllEquipment(): EquipEditData[] {
  type RawEquip = {
    name: string;
    hero: string;
    levels: Array<{ level: number }>;
    images?: { icon?: string };
  };
  const raw = _home.heroEquipment().get() as RawEquip[];
  return raw.map((e) => ({
    name: e.name,
    heroId: e.hero,
    maxLevel: e.levels[e.levels.length - 1]?.level ?? e.levels.length,
    imageUrl: e.images?.icon ? toPublicImageUrl(e.images.icon) : "",
  }));
}

// ── Crafted defenses ──────────────────────────────────────────────────────────

export function getCraftedDefenses(): CraftedDefenseEditData[] {
  type RawModule = { name: string; upgrades: unknown[] };
  type RawCrafted = {
    id: string;
    name: string;
    modules: RawModule[];
    images: Array<{ normal?: string }>;
  };
  const raw = _home.craftedDefenses().current().get() as RawCrafted[];
  return raw.map((c) => ({
    id: c.id,
    name: c.name,
    imageUrl: c.images[0]?.normal ? toPublicImageUrl(c.images[0].normal) : "",
    modules: c.modules.map((m) => ({ name: m.name, maxLevel: m.upgrades.length })),
  }));
}

// ── Walls ─────────────────────────────────────────────────────────────────────

export interface WallEditInfo {
  levels: WallLevelData[];
  totalAtTH: number;
  maxLevel: number;
}

export function getWallLevelsAtTH(thLevel: number): WallEditInfo {
  const { maxLevel, totalAtTH } = getHomeWallData(thLevel);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const wallData = require("clash-of-clans-data/data/home/walls/wall.json") as {
      levels: Array<{ level: number; townHallRequired: number; images?: { normal?: string } }>;
    };
    const levels: WallLevelData[] = wallData.levels
      .filter((l) => l.townHallRequired <= thLevel)
      .map((l) => ({
        level: l.level,
        imageUrl: l.images?.normal ? toPublicImageUrl(l.images.normal) : "",
      }));
    return { levels, totalAtTH, maxLevel };
  } catch {
    // Fallback: generate levels without images
    const levels: WallLevelData[] = Array.from({ length: maxLevel }, (_, i) => ({
      level: i + 1,
      imageUrl: "",
    }));
    return { levels, totalAtTH, maxLevel };
  }
}
