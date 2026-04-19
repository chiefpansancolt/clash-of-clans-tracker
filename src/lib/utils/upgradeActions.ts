import type { BuildingRecord, HomeVillageData, TrackedItem, TrackedHero } from "@/types/app/game";
import type { UpgradeStep } from "@/types/app/upgrade";

type BuildingRecordKey = "defenses" | "armyBuildings" | "resourceBuildings" | "traps";

export const startBuildingUpgrade = (
  hv: HomeVillageData,
  recordKey: BuildingRecordKey,
  buildingId: string,
  instanceIndex: number,
  step: UpgradeStep,
  builderId: number
): HomeVillageData  => {
  const record = hv[recordKey] as BuildingRecord;
  const instances = [...(record[buildingId] ?? [])];
  while (instances.length <= instanceIndex) instances.push({ level: 0 });
  instances[instanceIndex] = {
    ...instances[instanceIndex],
    upgrade: {
      upgradeStartedAt: new Date().toISOString(),
      finishesAt: new Date(Date.now() + step.durationMs).toISOString(),
      builderId,
    },
  };
  return { ...hv, [recordKey]: { ...record, [buildingId]: instances } };
}

export const finishBuildingUpgrade = (
  hv: HomeVillageData,
  recordKey: BuildingRecordKey,
  buildingId: string,
  instanceIndex: number
): HomeVillageData  => {
  const record = hv[recordKey] as BuildingRecord;
  const instances = [...(record[buildingId] ?? [])];
  const inst = instances[instanceIndex];
  if (!inst) return hv;
  instances[instanceIndex] = { ...inst, level: inst.level + 1, upgrade: undefined };
  return { ...hv, [recordKey]: { ...record, [buildingId]: instances } };
}

export const cancelBuildingUpgrade = (
  hv: HomeVillageData,
  recordKey: BuildingRecordKey,
  buildingId: string,
  instanceIndex: number
): HomeVillageData  => {
  const record = hv[recordKey] as BuildingRecord;
  const instances = [...(record[buildingId] ?? [])];
  const inst = instances[instanceIndex];
  if (!inst) return hv;
  instances[instanceIndex] = { ...inst, upgrade: undefined };
  return { ...hv, [recordKey]: { ...record, [buildingId]: instances } };
}

export const startResearchUpgrade = (
  hv: HomeVillageData,
  researchKey: "troops" | "spells" | "siegeMachines",
  name: string,
  step: UpgradeStep,
  builderId: number
): HomeVillageData  => {
  const items = hv[researchKey] as TrackedItem[];
  const updated = items.map((item) =>
    item.name === name
      ? {
          ...item,
          upgrade: {
            upgradeStartedAt: new Date().toISOString(),
            finishesAt: new Date(Date.now() + step.durationMs).toISOString(),
            builderId,
          },
        }
      : item
  );
  return { ...hv, [researchKey]: updated };
}

export const finishResearchUpgrade = (
  hv: HomeVillageData,
  researchKey: "troops" | "spells" | "siegeMachines",
  name: string
): HomeVillageData  => {
  const items = hv[researchKey] as TrackedItem[];
  const updated = items.map((item) =>
    item.name === name ? { ...item, level: item.level + 1, upgrade: undefined } : item
  );
  return { ...hv, [researchKey]: updated };
}

export const cancelResearchUpgrade = (
  hv: HomeVillageData,
  researchKey: "troops" | "spells" | "siegeMachines",
  name: string
): HomeVillageData  => {
  const items = hv[researchKey] as TrackedItem[];
  const updated = items.map((item) =>
    item.name === name ? { ...item, upgrade: undefined } : item
  );
  return { ...hv, [researchKey]: updated };
}

export const startPetUpgrade = (
  hv: HomeVillageData,
  name: string,
  step: UpgradeStep,
  builderId: number
): HomeVillageData  => {
  const pets = hv.pets.map((p) =>
    p.name === name
      ? {
          ...p,
          upgrade: {
            upgradeStartedAt: new Date().toISOString(),
            finishesAt: new Date(Date.now() + step.durationMs).toISOString(),
            builderId,
          },
        }
      : p
  );
  return { ...hv, pets };
}

export const finishPetUpgrade = (hv: HomeVillageData, name: string): HomeVillageData  => {
  const pets = hv.pets.map((p) =>
    p.name === name ? { ...p, level: p.level + 1, upgrade: undefined } : p
  ) as typeof hv.pets;
  return { ...hv, pets };
}

export const cancelPetUpgrade = (hv: HomeVillageData, name: string): HomeVillageData  => {
  const pets = hv.pets.map((p) =>
    p.name === name ? { ...p, upgrade: undefined } : p
  ) as typeof hv.pets;
  return { ...hv, pets };
}

export const startHeroUpgrade = (
  hv: HomeVillageData,
  name: string,
  step: UpgradeStep,
  builderId: number
): HomeVillageData  => {
  const heroes = hv.heroes.map((h) =>
    h.name === name
      ? {
          ...h,
          upgrade: {
            upgradeStartedAt: new Date().toISOString(),
            finishesAt: new Date(Date.now() + step.durationMs).toISOString(),
            builderId,
          },
        }
      : h
  ) as TrackedHero[];
  return { ...hv, heroes };
}

export const finishHeroUpgrade = (hv: HomeVillageData, name: string): HomeVillageData  => {
  const heroes = hv.heroes.map((h) =>
    h.name === name ? { ...h, level: h.level + 1, upgrade: undefined } : h
  ) as TrackedHero[];
  return { ...hv, heroes };
}

export const cancelHeroUpgrade = (hv: HomeVillageData, name: string): HomeVillageData  => {
  const heroes = hv.heroes.map((h) =>
    h.name === name ? { ...h, upgrade: undefined } : h
  ) as TrackedHero[];
  return { ...hv, heroes };
}

export const adjustBuildingUpgrade = (
  hv: HomeVillageData,
  recordKey: BuildingRecordKey,
  buildingId: string,
  instanceIndex: number,
  finishesAt: string
): HomeVillageData  => {
  const record = hv[recordKey] as BuildingRecord;
  const instances = [...(record[buildingId] ?? [])];
  const inst = instances[instanceIndex];
  if (!inst?.upgrade) return hv;
  instances[instanceIndex] = { ...inst, upgrade: { ...inst.upgrade, finishesAt } };
  return { ...hv, [recordKey]: { ...record, [buildingId]: instances } };
}

export const adjustResearchUpgrade = (
  hv: HomeVillageData,
  researchKey: "troops" | "spells" | "siegeMachines",
  name: string,
  finishesAt: string
): HomeVillageData  => {
  const items = hv[researchKey] as TrackedItem[];
  const updated = items.map((item) =>
    item.name === name && item.upgrade
      ? { ...item, upgrade: { ...item.upgrade, finishesAt } }
      : item
  );
  return { ...hv, [researchKey]: updated };
}

export const adjustPetUpgrade = (
  hv: HomeVillageData,
  name: string,
  finishesAt: string
): HomeVillageData  => {
  const pets = hv.pets.map((p) =>
    p.name === name && (p as any).upgrade
      ? { ...p, upgrade: { ...(p as any).upgrade, finishesAt } }
      : p
  ) as typeof hv.pets;
  return { ...hv, pets };
}

export const adjustHeroUpgrade = (
  hv: HomeVillageData,
  name: string,
  finishesAt: string
): HomeVillageData  => {
  const heroes = hv.heroes.map((h) =>
    h.name === name && h.upgrade
      ? { ...h, upgrade: { ...h.upgrade, finishesAt } }
      : h
  ) as TrackedHero[];
  return { ...hv, heroes };
}

export const startTownHallUpgrade = (hv: HomeVillageData, step: UpgradeStep, builderId: number): HomeVillageData  => {
  return {
    ...hv,
    townHallUpgrade: {
      upgradeStartedAt: new Date().toISOString(),
      finishesAt: new Date(Date.now() + step.durationMs).toISOString(),
      builderId,
    },
  };
}

export const finishTownHallUpgrade = (hv: HomeVillageData): HomeVillageData  => {
  return { ...hv, townHallLevel: hv.townHallLevel + 1, townHallUpgrade: undefined };
}

export const cancelTownHallUpgrade = (hv: HomeVillageData): HomeVillageData  => {
  return { ...hv, townHallUpgrade: undefined };
}

export const adjustTownHallUpgrade = (hv: HomeVillageData, finishesAt: string): HomeVillageData  => {
  if (!hv.townHallUpgrade) return hv;
  return { ...hv, townHallUpgrade: { ...hv.townHallUpgrade, finishesAt } };
}

export const startTownHallWeaponUpgrade = (hv: HomeVillageData, step: UpgradeStep, builderId: number): HomeVillageData  => {
  return {
    ...hv,
    townHallWeaponUpgrade: {
      upgradeStartedAt: new Date().toISOString(),
      finishesAt: new Date(Date.now() + step.durationMs).toISOString(),
      builderId,
    },
  };
}

export const finishTownHallWeaponUpgrade = (hv: HomeVillageData): HomeVillageData  => {
  return { ...hv, townHallWeaponLevel: (hv.townHallWeaponLevel ?? 1) + 1, townHallWeaponUpgrade: undefined };
}

export const cancelTownHallWeaponUpgrade = (hv: HomeVillageData): HomeVillageData  => {
  return { ...hv, townHallWeaponUpgrade: undefined };
}

export const adjustTownHallWeaponUpgrade = (hv: HomeVillageData, finishesAt: string): HomeVillageData  => {
  if (!hv.townHallWeaponUpgrade) return hv;
  return { ...hv, townHallWeaponUpgrade: { ...hv.townHallWeaponUpgrade, finishesAt } };
}

const patchCraftedModuleUpgrades = (
  hv: HomeVillageData,
  defenseId: string,
  moduleIndex: number,
  patch: (upgrades: (import("@/types/app/game").UpgradeState | undefined)[]) => (import("@/types/app/game").UpgradeState | undefined)[]
): HomeVillageData => {
  const existing = hv.craftedDefenses[defenseId] ?? { modules: [0, 0, 0] as [number, number, number] };
  const upgrades = [...(existing.moduleUpgrades ?? [])];
  return {
    ...hv,
    craftedDefenses: {
      ...hv.craftedDefenses,
      [defenseId]: { ...existing, moduleUpgrades: patch(upgrades) },
    },
  };
}

export const startCraftedDefenseUpgrade = (
  hv: HomeVillageData,
  defenseId: string,
  moduleIndex: number,
  step: UpgradeStep,
  builderId: number
): HomeVillageData  => {
  return patchCraftedModuleUpgrades(hv, defenseId, moduleIndex, (upgrades) => {
    const next = [...upgrades];
    next[moduleIndex] = {
      upgradeStartedAt: new Date().toISOString(),
      finishesAt: new Date(Date.now() + step.durationMs).toISOString(),
      builderId,
    };
    return next;
  });
}

export const finishCraftedDefenseUpgrade = (
  hv: HomeVillageData,
  defenseId: string,
  moduleIndex: number
): HomeVillageData  => {
  const existing = hv.craftedDefenses[defenseId] ?? { modules: [0, 0, 0] as [number, number, number] };
  const newModules = [...existing.modules] as [number, number, number];
  newModules[moduleIndex] = (newModules[moduleIndex] ?? 0) + 1;
  return patchCraftedModuleUpgrades({ ...hv, craftedDefenses: { ...hv.craftedDefenses, [defenseId]: { ...existing, modules: newModules } } }, defenseId, moduleIndex, (upgrades) => {
    const next = [...upgrades];
    next[moduleIndex] = undefined;
    return next;
  });
}

export const cancelCraftedDefenseUpgrade = (
  hv: HomeVillageData,
  defenseId: string,
  moduleIndex: number
): HomeVillageData  => {
  return patchCraftedModuleUpgrades(hv, defenseId, moduleIndex, (upgrades) => {
    const next = [...upgrades];
    next[moduleIndex] = undefined;
    return next;
  });
}

export const adjustCraftedDefenseUpgrade = (
  hv: HomeVillageData,
  defenseId: string,
  moduleIndex: number,
  finishesAt: string
): HomeVillageData  => {
  return patchCraftedModuleUpgrades(hv, defenseId, moduleIndex, (upgrades) => {
    const next = [...upgrades];
    if (next[moduleIndex]) next[moduleIndex] = { ...next[moduleIndex]!, finishesAt };
    return next;
  });
}

