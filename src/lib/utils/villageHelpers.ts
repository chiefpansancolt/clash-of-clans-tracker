import { builder, home } from "clash-of-clans-data";

import type {
  BuilderBaseData,
  ClanCapitalData,
  HomeVillageData,
  TrackedHero,
  TrackedItem,
  VillageData,
} from "@/types/app";

function makeTrackedItems(items: { name: string }[]): TrackedItem[] {
  return items.map((item) => ({ name: item.name, level: 0 }));
}

function makeTrackedHeroes(heroes: { name: string }[]): TrackedHero[] {
  return heroes.map((hero) => ({ name: hero.name, level: 0, equipment: [] }));
}

function defaultDistrict() {
  return { hallLevel: 0, buildings: {} };
}

export function createDefaultHomeVillage(townHallLevel = 1): HomeVillageData {
  const h = home();
  return {
    townHallLevel,
    trophies: 0,
    bestTrophies: 0,
    leagueName: "",
    attackWins: 0,
    defenseWins: 0,
    troops: makeTrackedItems(h.troops().get()),
    spells: makeTrackedItems(h.spells().get()),
    siegeMachines: makeTrackedItems(h.siegeMachines().get()),
    pets: makeTrackedItems(h.pets().get()),
    heroes: makeTrackedHeroes(h.heroes().get()),
    defenses: {},
    traps: {},
    resourceBuildings: {},
    armyBuildings: {},
    walls: {},
    craftedDefenses: {},
  };
}

export function createDefaultBuilderBase(builderHallLevel = 1): BuilderBaseData {
  const b = builder();
  return {
    builderHallLevel,
    builderBaseTrophies: 0,
    bestBuilderBaseTrophies: 0,
    builderBaseLeagueName: "",
    troops: makeTrackedItems(b.troops().get()),
    heroes: makeTrackedHeroes(b.heroes().get()),
    defenses: {},
    traps: {},
    resourceBuildings: {},
    armyBuildings: {},
    walls: {},
  };
}

export function createDefaultClanCapital(): ClanCapitalData {
  return {
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
}

export function createDefaultVillageData(
  townHallLevel = 1,
  builderHallLevel = 1
): VillageData {
  return {
    playerTag: "",
    expLevel: 0,
    warStars: 0,
    donations: 0,
    donationsReceived: 0,
    warPreference: "in",
    clan: undefined,
    homeVillage: createDefaultHomeVillage(townHallLevel),
    builderBase: createDefaultBuilderBase(builderHallLevel),
    clanCapital: createDefaultClanCapital(),
    achievements: [],
  };
}
