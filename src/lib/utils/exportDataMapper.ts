import { builder, home } from "clash-of-clans-data";

import type {
  BuilderBaseData,
  BuildingInstance,
  BuildingRecord,
  ClanCapitalData,
  HomeVillageData,
  TrackedEquipment,
  TrackedHero,
  TrackedItem,
  VillageData,
} from "@/types/app/game";

// ── Raw export format ─────────────────────────────────────────────────────────

interface ExportEntry {
  data: number; // numeric dataId
  lvl?: number;
  cnt?: number; // count of this entry at this level
  timer?: number; // remaining upgrade seconds
  helper_recurrent?: boolean; // builder boost active
}

export interface ExportData {
  tag: string;
  timestamp?: number;
  // Home village
  buildings?: ExportEntry[];
  traps?: ExportEntry[];
  units?: ExportEntry[];
  siege_machines?: ExportEntry[];
  heroes?: ExportEntry[];
  spells?: ExportEntry[];
  pets?: ExportEntry[];
  equipment?: ExportEntry[];
  // Builder base
  buildings2?: ExportEntry[];
  traps2?: ExportEntry[];
  units2?: ExportEntry[];
  heroes2?: ExportEntry[];
}

// ── dataId lookup map ─────────────────────────────────────────────────────────

interface DataItem {
  id: string;
  name: string;
  category: string;
  base: "home" | "builder";
  heroId?: string; // only set for hero-equipment items
}

function buildDataIdMap(): Map<number, DataItem> {
  const h = home();
  const b = builder();
  const map = new Map<number, DataItem>();

  const register = (items: { dataId?: number; id: string; name: string; category: string }[], base: "home" | "builder") => {
    for (const item of items) {
      if (item.dataId !== undefined) map.set(item.dataId, { id: item.id, name: item.name, category: item.category, base });
    }
  };

  // Home village
  register(h.defenses().get(), "home");
  register(h.traps().get(), "home");
  register(h.resourceBuildings().get(), "home");
  register(h.armyBuildings().get(), "home");
  register(h.walls().get(), "home");
  register(h.troops().get(), "home");
  register(h.spells().get(), "home");
  register(h.siegeMachines().get(), "home");
  register(h.pets().get(), "home");
  register(h.heroes().get(), "home");

  // Hero equipment — registered separately to capture the hero linkage
  for (const raw of h.heroEquipment().get()) {
    const item = raw as unknown as { dataId?: number; id: string; name: string; category: string; hero?: string };
    if (item.dataId !== undefined) {
      map.set(item.dataId, {
        id: item.id,
        name: item.name,
        category: item.category,
        base: "home",
        heroId: item.hero,
      });
    }
  }

  const thRaw = h.townHall().first() as unknown as { dataId?: number; id: string; name: string } | undefined;
  if (thRaw?.dataId) map.set(thRaw.dataId, { id: thRaw.id, name: thRaw.name, category: "town-hall", base: "home" });

  // Army/utility buildings not exposed by h.armyBuildings() — loaded directly from package data files
  // These cover: Barracks, Dark Barracks, Laboratory, Spell Factory, Dark Spell Factory,
  // Workshop, Pet House, Blacksmith, Hero Hall, Clan Castle, Helper Hut
  const extraArmyFiles = [
    "army-buildings/barracks",
    "army-buildings/dark-barracks",
    "army-buildings/laboratory",
    "army-buildings/spell-factory",
    "army-buildings/dark-spell-factory",
    "army-buildings/workshop",
    "army-buildings/pet-house",
    "army-buildings/blacksmith",
    "army-buildings/hero-hall",
    "army-buildings/hero-banner",
    "resource-buildings/clan-castle",
    "other/helper-hut",
  ];
  for (const rel of extraArmyFiles) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const raw = require(`clash-of-clans-data/data/home/${rel}.json`) as { dataId?: number; id: string; name: string };
      if (raw.dataId !== undefined && !map.has(raw.dataId)) {
        map.set(raw.dataId, { id: raw.id, name: raw.name, category: "army", base: "home" });
      }
    } catch { /* file missing in this version of the package — skip */ }
  }

  // Builder base
  register(b.defenses().get(), "builder");
  register(b.resourceBuildings().get(), "builder");
  register(b.armyBuildings().get(), "builder");
  register(b.walls().get(), "builder");
  register(b.troops().get(), "builder");
  register(b.heroes().get(), "builder");

  const bhRaw = b.builderHall().first() as unknown as { dataId?: number; id: string; name: string } | undefined;
  if (bhRaw?.dataId) map.set(bhRaw.dataId, { id: bhRaw.id, name: bhRaw.name, category: "builder-hall", base: "builder" });

  return map;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toUpgradeState(entry: ExportEntry) {
  if (entry.timer === undefined) return undefined;
  // Use now as the start time (we only know remaining seconds, not start time)
  return { upgradeStartedAt: new Date().toISOString() };
}

function entriesToBuildingRecord(
  entries: ExportEntry[],
  dataMap: Map<number, DataItem>,
  targetBase: "home" | "builder",
  targetCategory: string
): BuildingRecord {
  const record: BuildingRecord = {};

  for (const entry of entries) {
    const item = dataMap.get(entry.data);
    if (!item || item.base !== targetBase || item.category !== targetCategory) continue;

    const count = entry.cnt ?? 1;
    const level = entry.lvl ?? 0;
    const instances: BuildingInstance[] = Array.from({ length: count }, () => ({
      level,
      upgrade: toUpgradeState(entry),
    }));

    if (!record[item.id]) record[item.id] = [];
    record[item.id].push(...instances);
  }

  return record;
}

function entriesToWalls(
  entries: ExportEntry[],
  dataMap: Map<number, DataItem>,
  targetBase: "home" | "builder"
): Record<string, number> {
  const walls: Record<string, number> = {};

  for (const entry of entries) {
    const item = dataMap.get(entry.data);
    if (!item || item.base !== targetBase || item.category !== "wall") continue;
    const level = String(entry.lvl ?? 0);
    walls[level] = (walls[level] ?? 0) + (entry.cnt ?? 1);
  }

  return walls;
}

function entriesToTrackedItems(entries: ExportEntry[], dataMap: Map<number, DataItem>): TrackedItem[] {
  return entries.flatMap((entry) => {
    const item = dataMap.get(entry.data);
    if (!item) return [];
    return [{ name: item.name, level: entry.lvl ?? 0, upgrade: toUpgradeState(entry) }];
  });
}

function buildEquipmentByHeroMap(
  entries: ExportEntry[],
  dataMap: Map<number, DataItem>
): Map<string, TrackedEquipment[]> {
  const byHero = new Map<string, TrackedEquipment[]>();
  for (const entry of entries) {
    const item = dataMap.get(entry.data);
    if (!item || !item.heroId) continue;
    const equip: TrackedEquipment = { name: item.name, level: entry.lvl ?? 0 };
    if (!byHero.has(item.heroId)) byHero.set(item.heroId, []);
    byHero.get(item.heroId)!.push(equip);
  }
  return byHero;
}

function entriesToTrackedHeroes(
  entries: ExportEntry[],
  dataMap: Map<number, DataItem>,
  equipmentByHero?: Map<string, TrackedEquipment[]>
): TrackedHero[] {
  return entries.flatMap((entry) => {
    const item = dataMap.get(entry.data);
    if (!item) return [];
    return [{
      name: item.name,
      level: entry.lvl ?? 0,
      equipment: equipmentByHero?.get(item.id) ?? [],
      upgrade: toUpgradeState(entry),
    }];
  });
}

function extractHallLevel(
  entries: ExportEntry[],
  dataMap: Map<number, DataItem>,
  category: "town-hall" | "builder-hall"
): number {
  for (const entry of entries) {
    const item = dataMap.get(entry.data);
    if (item?.category === category) return entry.lvl ?? 0;
  }
  return 0;
}

// ── Default district ──────────────────────────────────────────────────────────

function defaultDistrict() {
  return { hallLevel: 0, buildings: {} };
}

// ── Public mapper ─────────────────────────────────────────────────────────────

/**
 * Maps a raw Clash of Clans game export (exportData.json format) to VillageData.
 * Uses clash-of-clans-data to resolve numeric dataIds to item ids/names.
 * Building instances are expanded from cnt fields.
 * Upgrade timers are noted but start times are approximated to now.
 */
export function mapExportDataToVillageData(data: ExportData): VillageData {
  const dataMap = buildDataIdMap();

  const allHomeBuildings = [...(data.buildings ?? [])];

  const townHallLevel = extractHallLevel(allHomeBuildings, dataMap, "town-hall");

  const homeEquipmentByHero = buildEquipmentByHeroMap(data.equipment ?? [], dataMap);

  const homeVillage: HomeVillageData = {
    townHallLevel,
    trophies: 0,
    bestTrophies: 0,
    leagueName: "",
    attackWins: 0,
    defenseWins: 0,
    troops: entriesToTrackedItems(data.units ?? [], dataMap),
    spells: entriesToTrackedItems(data.spells ?? [], dataMap),
    siegeMachines: entriesToTrackedItems(data.siege_machines ?? [], dataMap),
    pets: entriesToTrackedItems(data.pets ?? [], dataMap),
    heroes: entriesToTrackedHeroes(data.heroes ?? [], dataMap, homeEquipmentByHero),
    defenses: entriesToBuildingRecord(allHomeBuildings, dataMap, "home", "defense"),
    traps: entriesToBuildingRecord(data.traps ?? [], dataMap, "home", "trap"),
    resourceBuildings: entriesToBuildingRecord(allHomeBuildings, dataMap, "home", "resource"),
    armyBuildings: entriesToBuildingRecord(allHomeBuildings, dataMap, "home", "army"),
    walls: entriesToWalls(allHomeBuildings, dataMap, "home"),
  };

  const allBuilderBuildings = [...(data.buildings2 ?? [])];

  const builderHallLevel = extractHallLevel(allBuilderBuildings, dataMap, "builder-hall");

  const builderBase: BuilderBaseData = {
    builderHallLevel,
    builderBaseTrophies: 0,
    bestBuilderBaseTrophies: 0,
    builderBaseLeagueName: "",
    troops: entriesToTrackedItems(data.units2 ?? [], dataMap),
    heroes: entriesToTrackedHeroes(data.heroes2 ?? [], dataMap),
    defenses: entriesToBuildingRecord(allBuilderBuildings, dataMap, "builder", "defense"),
    resourceBuildings: entriesToBuildingRecord(allBuilderBuildings, dataMap, "builder", "resource"),
    armyBuildings: entriesToBuildingRecord(allBuilderBuildings, dataMap, "builder", "army"),
  };

  const clanCapital: ClanCapitalData = {
    clanCapitalContributions: 0,
    capitalPeak: defaultDistrict(),
    barbarianCamp: defaultDistrict(),
    wizardValley: defaultDistrict(),
    buildersWorkshop: defaultDistrict(),
    dragonCliffs: defaultDistrict(),
    golemQuarry: defaultDistrict(),
    skeletonPark: defaultDistrict(),
    goblinMines: defaultDistrict(),
  };

  return {
    playerTag: data.tag ?? "",
    expLevel: 0,
    warStars: 0,
    donations: 0,
    donationsReceived: 0,
    warPreference: "in",
    role: "",
    homeVillage,
    builderBase,
    clanCapital,
    achievements: [],
  };
}

/**
 * Returns true if the given JSON object matches the raw export format.
 * Checks for the presence of `buildings` array with numeric `data` fields.
 */
export function isExportDataFormat(json: unknown): json is ExportData {
  if (!json || typeof json !== "object") return false;
  const obj = json as Record<string, unknown>;
  return (
    Array.isArray(obj.buildings) &&
    (obj.buildings as ExportEntry[]).length > 0 &&
    typeof (obj.buildings as ExportEntry[])[0].data === "number"
  );
}
