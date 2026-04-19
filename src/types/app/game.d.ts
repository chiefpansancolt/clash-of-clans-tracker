export interface UpgradeState {
  upgradeStartedAt: string;
  finishesAt: string;
  // 1–7 (7 = goblin); for research queue: 1 = lab, 7 = goblin
  builderId: number;
  boostTimeSaved?: number;
}

export interface BuildingInstance {
  // 0 = not yet built
  level: number;
  upgrade?: UpgradeState;
  // TH17+ supercharge tier (0 = none, 1/2/3 = tier)
  superchargeLevel?: number;
}

// Key = clash-of-clans-data id (e.g. "cannon"), value = instances
export type BuildingRecord = Record<string, BuildingInstance[]>;

// Keys used to index into HomeVillageData building records
export type BuildingRecordKey = "defenses" | "armyBuildings" | "resourceBuildings" | "traps";

// Keys used to index into HomeVillageData research records
export type ResearchKey = "troops" | "spells" | "siegeMachines";

// Capital buildings have no upgrade times
export type CapitalBuildingRecord = Record<string, number[]>;

export interface TrackedItem {
  name: string;
  // 0 = locked / not researched
  level: number;
  upgrade?: UpgradeState;
}

export interface TrackedEquipment {
  name: string;
  level: number;
  // maxLevel derived from clash-of-clans-data at runtime; no upgrade tracking
}

export interface TrackedHero {
  name: string;
  level: number;
  upgrade?: UpgradeState;
  equipment: TrackedEquipment[];
}

export interface TrackedAchievement {
  name: string;
  // 0–3
  stars: number;
  value: number;
  target: number;
  // "home" | "builderBase" | "clanCapital"
  village: string;
}

/** Module levels for a single crafted defense (3 independent modules). */
export interface CraftedDefenseData {
  // 0 = not upgraded per module
  modules: [number, number, number];
  moduleUpgrades?: (UpgradeState | undefined)[];
}

export interface HomeVillageData {
  // 1–18
  townHallLevel: number;
  trophies: number;
  bestTrophies: number;
  leagueName: string;
  attackWins: number;
  defenseWins: number;

  troops: TrackedItem[];
  spells: TrackedItem[];
  siegeMachines: TrackedItem[];
  pets: TrackedItem[];

  heroes: TrackedHero[];

  defenses: BuildingRecord;
  traps: BuildingRecord;
  resourceBuildings: BuildingRecord;
  armyBuildings: BuildingRecord;

  // wall level (as string key) → count of wall segments at that level
  walls: Record<string, number>;

  // Crafted defenses (TH18 Crafting Station) — keyed by defense id e.g. "roaster"
  craftedDefenses: Record<string, CraftedDefenseData>;

  townHallUpgrade?: UpgradeState;
  // TH weapon level (Inferno Artillery on TH17: levels 1–5; 0 = no weapon / N/A)
  townHallWeaponLevel?: number;
  townHallWeaponUpgrade?: UpgradeState;

  // Queue planning (pending upgrades not yet started)
  builderQueues?: Record<string, import("@/types/app/queue").BuilderQueueItem[]>;
  researchQueue?: Record<string, import("@/types/app/queue").ResearchQueueItem[]>;
  petQueue?: import("@/types/app/queue").PetQueueItem[];
}

export interface BuilderBaseData {
  // 1–10
  builderHallLevel: number;
  builderBaseTrophies: number;
  bestBuilderBaseTrophies: number;
  builderBaseLeagueName: string;

  troops: TrackedItem[];
  heroes: TrackedHero[];

  defenses: BuildingRecord;
  traps: BuildingRecord;
  resourceBuildings: BuildingRecord;
  armyBuildings: BuildingRecord;
  walls: Record<string, number>;
}

export interface ClanCapitalDistrictData {
  hallLevel: number;
  // no upgrade times tracked for capital buildings
  buildings: CapitalBuildingRecord;
  walls?: Record<string, number>;
}

export interface ClanCapitalData {
  clanCapitalContributions: number;

  capitalPeak: ClanCapitalDistrictData;
  barbarianCamp: ClanCapitalDistrictData;
  wizardValley: ClanCapitalDistrictData;
  balloonLagoon: ClanCapitalDistrictData;
  buildersWorkshop: ClanCapitalDistrictData;
  dragonCliffs: ClanCapitalDistrictData;
  golemQuarry: ClanCapitalDistrictData;
  skeletonPark: ClanCapitalDistrictData;
  goblinMines: ClanCapitalDistrictData;

  troops: TrackedItem[];
  spells: TrackedItem[];
}

export interface ClanData {
  tag: string;
  name: string;
  clanLevel: number;
  role: "leader" | "coLeader" | "elder" | "member" | "";
}

export interface VillageData {
  playerTag: string;
  expLevel: number;
  warStars: number;
  donations: number;
  donationsReceived: number;
  warPreference: "in" | "out";
  clan?: ClanData;

  homeVillage: HomeVillageData;
  builderBase: BuilderBaseData;
  clanCapital: ClanCapitalData;
  achievements: TrackedAchievement[];
}
