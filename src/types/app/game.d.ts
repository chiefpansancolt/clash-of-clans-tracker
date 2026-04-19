export interface UpgradeState {
  upgradeStartedAt: string; // ISO 8601 timestamp when upgrade began
  finishesAt: string;       // ISO 8601 — computed from package time at start
  builderId: number;        // 1–7 (7 = goblin); for research queue: 1 = lab, 7 = goblin
  boostTimeSaved?: number;  // total minutes saved by all boosts applied (additive)
}

export interface BuildingInstance {
  level: number; // current completed level (0 = not yet built)
  upgrade?: UpgradeState; // present only while upgrading
  superchargeLevel?: number; // TH17+ supercharge tier (0 = none, 1/2/3 = tier)
}

// Key = clash-of-clans-data id (e.g. "cannon"), value = instances
export type BuildingRecord = Record<string, BuildingInstance[]>;

// Capital buildings have no upgrade times
export type CapitalBuildingRecord = Record<string, number[]>;

export interface TrackedItem {
  name: string; // API name e.g. "Barbarian", "Lightning Spell"
  level: number; // current completed level (0 = locked / not researched)
  upgrade?: UpgradeState; // present only while researching
}

export interface TrackedEquipment {
  name: string;
  level: number;
  // maxLevel derived from clash-of-clans-data at runtime; no upgrade tracking
}

export interface TrackedHero {
  name: string;
  level: number;
  upgrade?: UpgradeState; // hero upgrade in progress
  equipment: TrackedEquipment[]; // currently equipped items
}

export interface TrackedAchievement {
  name: string;
  stars: number; // 0–3
  value: number; // current progress
  target: number; // completion goal
  village: string; // "home" | "builderBase" | "clanCapital"
}

/** Module levels for a single crafted defense (3 independent modules). */
export interface CraftedDefenseData {
  modules: [number, number, number]; // upgrade level of each module (0 = not upgraded)
  moduleUpgrades?: (UpgradeState | undefined)[]; // upgrade state per module index
}

export interface HomeVillageData {
  townHallLevel: number; // 1–18
  trophies: number;
  bestTrophies: number;
  leagueName: string;
  attackWins: number;
  defenseWins: number;

  // Troops (incl. super troops), spells, siege machines, pets
  troops: TrackedItem[];
  spells: TrackedItem[];
  siegeMachines: TrackedItem[];
  pets: TrackedItem[];

  // Heroes: BK, AQ, GW, RC, Minion Prince, Dragon Duke
  heroes: TrackedHero[];

  // Buildings (keyed by clash-of-clans-data id, multiple instances supported)
  defenses: BuildingRecord;
  traps: BuildingRecord;
  resourceBuildings: BuildingRecord;
  armyBuildings: BuildingRecord;

  // Walls: level (as string key) → count of wall segments at that level
  walls: Record<string, number>;

  // Crafted defenses (TH18 Crafting Station) — keyed by defense id e.g. "roaster"
  craftedDefenses: Record<string, CraftedDefenseData>;

  // Town Hall self-upgrade (e.g. TH17 → TH18)
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
  builderHallLevel: number; // 1–10
  builderBaseTrophies: number;
  bestBuilderBaseTrophies: number;
  builderBaseLeagueName: string;

  troops: TrackedItem[];
  heroes: TrackedHero[]; // Battle Machine, Battle Copter

  defenses: BuildingRecord;
  traps: BuildingRecord;
  resourceBuildings: BuildingRecord;
  armyBuildings: BuildingRecord;
  walls: Record<string, number>; // level (string) → count of segments at that level
}

export interface ClanCapitalDistrictData {
  hallLevel: number; // Capital Hall level or District Hall level
  buildings: CapitalBuildingRecord; // buildings in this district (no upgrade times)
  walls?: Record<string, number>; // wall level (as string) → count of wall segments
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
  // Cross-base player stats
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
