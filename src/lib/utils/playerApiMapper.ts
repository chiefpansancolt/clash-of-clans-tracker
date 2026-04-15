import { home } from "clash-of-clans-data";

import type { PlayerApiResponse } from "@/types/app";
import type {
  BuilderBaseData,
  ClanCapitalData,
  HomeVillageData,
  TrackedEquipment,
  TrackedHero,
  TrackedItem,
  VillageData,
} from "@/types/app/game";

function defaultDistrict() {
  return { hallLevel: 0, buildings: {} };
}

/**
 * Maps a Clash of Clans Player API response to VillageData.
 * Troops are classified using the clash-of-clans-data package so that
 * siege machines and pets are placed in their respective sections.
 * Building levels are not available in the Player API — those sections
 * are initialised empty for the user to fill in.
 */
export function mapPlayerApiToVillageData(player: PlayerApiResponse): VillageData {
  const h = home();
  const siegeMachineNames = new Set(h.siegeMachines().get().map((s) => s.name));
  const petNames = new Set(h.pets().get().map((p) => p.name));

  const homeTroops: TrackedItem[] = [];
  const siegeMachines: TrackedItem[] = [];
  const pets: TrackedItem[] = [];
  const builderTroops: TrackedItem[] = [];

  for (const t of player.troops ?? []) {
    const item: TrackedItem = { name: t.name, level: t.level };
    if (t.village === "builderBase") {
      builderTroops.push(item);
    } else if (siegeMachineNames.has(t.name)) {
      siegeMachines.push(item);
    } else if (petNames.has(t.name)) {
      pets.push(item);
    } else {
      homeTroops.push(item);
    }
  }

  const homeHeroes: TrackedHero[] = [];
  const builderHeroes: TrackedHero[] = [];

  for (const hero of player.heroes ?? []) {
    const equipment: TrackedEquipment[] = (hero.equipment ?? []).map((e) => ({
      name: e.name,
      level: e.level,
    }));
    const tracked: TrackedHero = { name: hero.name, level: hero.level, equipment };
    if (hero.village === "builderBase") {
      builderHeroes.push(tracked);
    } else {
      homeHeroes.push(tracked);
    }
  }

  const spells: TrackedItem[] = (player.spells ?? []).map((s) => ({
    name: s.name,
    level: s.level,
  }));

  const homeVillage: HomeVillageData = {
    townHallLevel: player.townHallLevel,
    trophies: player.trophies,
    bestTrophies: player.bestTrophies,
    leagueName: player.leagueTier?.name ?? "",
    attackWins: player.attackWins,
    defenseWins: player.defenseWins,
    troops: homeTroops,
    spells,
    siegeMachines,
    pets,
    heroes: homeHeroes,
    defenses: {},
    traps: {},
    resourceBuildings: {},
    armyBuildings: {},
    walls: {},
    craftedDefenses: {},
  };

  const builderBase: BuilderBaseData = {
    builderHallLevel: player.builderHallLevel ?? 0,
    builderBaseTrophies: player.builderBaseTrophies ?? 0,
    bestBuilderBaseTrophies: player.bestBuilderBaseTrophies ?? 0,
    builderBaseLeagueName: player.builderBaseLeague?.name ?? "",
    troops: builderTroops,
    heroes: builderHeroes,
    defenses: {},
    traps: {},
    resourceBuildings: {},
    armyBuildings: {},
    walls: {},
  };

  const clanCapital: ClanCapitalData = {
    clanCapitalContributions: player.clanCapitalContributions ?? 0,
    capitalPeak: defaultDistrict(),
    barbarianCamp: defaultDistrict(),
    wizardValley: defaultDistrict(),
    buildersWorkshop: defaultDistrict(),
    dragonCliffs: defaultDistrict(),
    golemQuarry: defaultDistrict(),
    skeletonPark: defaultDistrict(),
    goblinMines: defaultDistrict(),
  };

  const achievements = (player.achievements ?? []).map((a) => ({
    name: a.name,
    stars: a.stars,
    value: a.value,
    target: a.target,
    village: a.village,
  }));

  return {
    playerTag: player.tag,
    expLevel: player.expLevel,
    warStars: player.warStars,
    donations: player.donations,
    donationsReceived: player.donationsReceived,
    warPreference: (player.warPreference ?? "in") as "in" | "out",
    clan: player.clan
      ? {
          tag: player.clan.tag,
          name: player.clan.name,
          clanLevel: player.clan.clanLevel,
          role: (player.role ?? "") as "leader" | "coLeader" | "elder" | "member" | "",
        }
      : undefined,
    homeVillage,
    builderBase,
    clanCapital,
    achievements,
  };
}

/**
 * Merges building data from a VillageData JSON into an API-sourced VillageData.
 * The API data wins for all player stats, troops, spells, heroes, and achievements.
 * The JSON data provides building levels (defenses, traps, resource/army buildings,
 * walls, clan capital districts) which are not available from the Player API.
 */
export function mergeWithBuildingData(apiData: VillageData, buildingJson: VillageData): VillageData {
  // Merge hero equipment: prefer the building JSON (has all equipment pieces from the export),
  // fall back to the API's equipped-only list if the export has none for that hero.
  const mergedHomeHeroes = apiData.homeVillage.heroes.map((apiHero) => {
    const exportHero = buildingJson.homeVillage.heroes.find((h) => h.name === apiHero.name);
    return {
      ...apiHero,
      equipment: exportHero?.equipment?.length ? exportHero.equipment : apiHero.equipment,
    };
  });

  return {
    ...apiData,
    homeVillage: {
      ...apiData.homeVillage,
      defenses: buildingJson.homeVillage.defenses,
      traps: buildingJson.homeVillage.traps,
      resourceBuildings: buildingJson.homeVillage.resourceBuildings,
      armyBuildings: buildingJson.homeVillage.armyBuildings,
      walls: buildingJson.homeVillage.walls,
      craftedDefenses: buildingJson.homeVillage.craftedDefenses,
      heroes: mergedHomeHeroes,
    },
    builderBase: {
      ...apiData.builderBase,
      defenses: buildingJson.builderBase.defenses,
      traps: buildingJson.builderBase.traps,
      resourceBuildings: buildingJson.builderBase.resourceBuildings,
      armyBuildings: buildingJson.builderBase.armyBuildings,
      walls: buildingJson.builderBase.walls,
    },
    clanCapital: {
      ...apiData.clanCapital,
      capitalPeak: buildingJson.clanCapital.capitalPeak,
      barbarianCamp: buildingJson.clanCapital.barbarianCamp,
      wizardValley: buildingJson.clanCapital.wizardValley,
      buildersWorkshop: buildingJson.clanCapital.buildersWorkshop,
      dragonCliffs: buildingJson.clanCapital.dragonCliffs,
      golemQuarry: buildingJson.clanCapital.golemQuarry,
      skeletonPark: buildingJson.clanCapital.skeletonPark,
      goblinMines: buildingJson.clanCapital.goblinMines,
    },
  };
}
