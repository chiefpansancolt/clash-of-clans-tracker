"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { TabItem, Tabs } from "flowbite-react";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import {
  getDefensesAtTH,
  getArmyBuildingsAtTH,
  getResourceBuildingsAtTH,
  getTrapsAtTH,
  getHeroesAtTH,
  getGuardiansAtTH,
  getCraftedDefenses,
} from "@/lib/utils/massEditHelpers";
import {
  getBuildingUpgradeSteps,
  getHeroUpgradeSteps,
  getBuilderSlots,
  countActiveInRecord,
  countActiveHeroes,
  getTownHallUpgradeStep,
  getTownHallWeaponInfo,
  getTownHallWeaponUpgradeSteps,
  getTownHallImageUrl,
  getTownHallMaxLevel,
  isActiveUpgrade,
} from "@/lib/utils/upgradeHelpers";
import {
  startBuildingUpgrade,
  finishBuildingUpgrade,
  cancelBuildingUpgrade,
  adjustBuildingUpgrade,
  startHeroUpgrade,
  finishHeroUpgrade,
  cancelHeroUpgrade,
  adjustHeroUpgrade,
  startTownHallUpgrade,
  finishTownHallUpgrade,
  cancelTownHallUpgrade,
  adjustTownHallUpgrade,
  startTownHallWeaponUpgrade,
  finishTownHallWeaponUpgrade,
  cancelTownHallWeaponUpgrade,
  adjustTownHallWeaponUpgrade,
} from "@/lib/utils/upgradeActions";
import { massEditTabsTheme } from "@/lib/constants/massEditTheme";
import { UpgradeRow } from "@/components/upgrade/UpgradeRow";
import { TownHallTab } from "@/components/upgrade/builder/TownHallTab";
import type { BuildingRecord } from "@/types/app/game";

type BuildingRecordKey = "defenses" | "armyBuildings" | "resourceBuildings" | "traps";

function TabTitle({ label, count }: { label: string; count: number }) {
  return (
    <span className="flex items-center gap-1.5">
      {label}
      {count > 0 && (
        <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold leading-none text-gray-900">
          {count}
        </span>
      )}
    </span>
  );
}

export default function BuilderUpgradePage() {
  const router = useRouter();
  const { activePlaythrough, appSettings, isLoaded, updatePlaythrough } = usePlaythrough();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const hv = activePlaythrough?.data.homeVillage;
  const thLevel = hv?.townHallLevel ?? 1;

  const defenses = useMemo(() => getDefensesAtTH(thLevel), [thLevel]);
  const army = useMemo(() => getArmyBuildingsAtTH(thLevel), [thLevel]);
  const resources = useMemo(() => getResourceBuildingsAtTH(thLevel), [thLevel]);
  const traps = useMemo(() => getTrapsAtTH(thLevel), [thLevel]);
  const heroes = useMemo(() => getHeroesAtTH(thLevel), [thLevel]);
  const guardians = useMemo(() => (thLevel >= 18 ? getGuardiansAtTH(thLevel) : []), [thLevel]);
  const craftedData = useMemo(() => (thLevel >= 18 ? getCraftedDefenses() : []), [thLevel]);

  const slots = hv ? getBuilderSlots(hv, appSettings.goblinBuilderEnabled) : [];

  function save(newHv: typeof hv) {
    if (!activePlaythrough || !newHv) return;
    updatePlaythrough(activePlaythrough.id, {
      data: { ...activePlaythrough.data, homeVillage: newHv },
    });
  }

  if (!activePlaythrough || !hv) return null;

  function renderBuildings(
    buildings: ReturnType<typeof getDefensesAtTH>,
    recordKey: BuildingRecordKey
  ) {
    return (
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {buildings.map((b) => {
          const instances = Array.from({ length: b.instanceCount }, (_, i) => {
            const inst = (hv![recordKey][b.id] ?? [])[i] ?? { level: 0 };
            return { currentLevel: inst.level, maxLevel: b.maxLevel, upgradeState: inst.upgrade };
          });
          return (
            <UpgradeRow
              key={b.id}
              name={b.name}
              imageUrl={b.imageUrl}
              instances={instances}
              getAllSteps={(level, instanceIndex) => getBuildingUpgradeSteps(b.id, level, thLevel, instanceIndex)}
              slots={slots}
              onStartUpgrade={(idx, step, builderId) =>
                save(startBuildingUpgrade(hv!, recordKey, b.id, idx, step, builderId))
              }
              onFinishUpgrade={(idx) => save(finishBuildingUpgrade(hv!, recordKey, b.id, idx))}
              onCancelUpgrade={(idx) => save(cancelBuildingUpgrade(hv!, recordKey, b.id, idx))}
              onAdjustUpgrade={(idx, finishesAt) =>
                save(adjustBuildingUpgrade(hv!, recordKey, b.id, idx, finishesAt))
              }
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Builder</h1>
          <span className="text-sm text-gray-500">TH{thLevel}</span>
          <div className="ml-auto">
            <Link
              href="/upgrade/home/builder/queue"
              className="rounded-lg bg-primary/80 px-3 py-1.5 text-xs font-bold text-accent hover:bg-primary"
            >
              Queue
            </Link>
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute top-0 right-0 z-10 h-13 w-12 bg-linear-to-l from-highlight to-transparent" />
        <Tabs variant="pills" theme={massEditTabsTheme}>

          <TabItem title={<TabTitle label="Defenses" count={countActiveInRecord(hv.defenses as BuildingRecord)} />}>
            {renderBuildings(defenses, "defenses")}
          </TabItem>

          <TabItem title={<TabTitle label="Army" count={countActiveInRecord(hv.armyBuildings as BuildingRecord)} />}>
            {renderBuildings(army, "armyBuildings")}
          </TabItem>

          <TabItem title={<TabTitle label="Resources" count={countActiveInRecord(hv.resourceBuildings as BuildingRecord)} />}>
            {renderBuildings(resources, "resourceBuildings")}
          </TabItem>

          <TabItem title={<TabTitle label="Traps" count={countActiveInRecord(hv.traps as BuildingRecord)} />}>
            {renderBuildings(traps, "traps")}
          </TabItem>

          {thLevel >= 7 && (
          <TabItem title={<TabTitle label="Heroes" count={countActiveHeroes(hv.heroes as any)} />}>
            {heroes.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No heroes available at TH{thLevel}.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {heroes.map((h) => {
                  const saved = hv.heroes.find((hero) => hero.name === h.name);
                  const currentLevel = saved?.level ?? 0;
                  return (
                    <UpgradeRow
                      key={h.id}
                      name={h.name}
                      imageUrl={h.imageUrl}
                      instances={[{ currentLevel, maxLevel: h.maxLevel, upgradeState: saved?.upgrade }]}
                      getAllSteps={(level) => getHeroUpgradeSteps(h.id, level, thLevel)}
                      slots={slots}
                      onStartUpgrade={(_idx, step, builderId) =>
                        save(startHeroUpgrade(hv!, h.name, step, builderId))
                      }
                      onFinishUpgrade={() => save(finishHeroUpgrade(hv!, h.name))}
                      onCancelUpgrade={() => save(cancelHeroUpgrade(hv!, h.name))}
                      onAdjustUpgrade={(_idx, finishesAt) =>
                        save(adjustHeroUpgrade(hv!, h.name, finishesAt))
                      }
                    />
                  );
                })}
              </div>
            )}
          </TabItem>
          )}

          {thLevel >= 18 && (
            <TabItem title={<TabTitle label="Guardians" count={0} />}>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {guardians.map((g) => {
                  const instances = Array.from({ length: g.instanceCount }, (_, i) => {
                    const inst = (hv!.defenses[g.id] ?? [])[i] ?? { level: 0 };
                    return { currentLevel: inst.level, maxLevel: g.maxLevel, upgradeState: inst.upgrade };
                  });
                  return (
                    <UpgradeRow
                      key={g.id}
                      name={g.name}
                      imageUrl={g.imageUrl}
                      instances={instances}
                      getAllSteps={(level, instanceIndex) => getBuildingUpgradeSteps(g.id, level, thLevel, instanceIndex)}
                      slots={slots}
                      onStartUpgrade={(idx, step, builderId) =>
                        save(startBuildingUpgrade(hv!, "defenses", g.id, idx, step, builderId))
                      }
                      onFinishUpgrade={(idx) => save(finishBuildingUpgrade(hv!, "defenses", g.id, idx))}
                      onCancelUpgrade={(idx) => save(cancelBuildingUpgrade(hv!, "defenses", g.id, idx))}
                      onAdjustUpgrade={(idx, finishesAt) =>
                        save(adjustBuildingUpgrade(hv!, "defenses", g.id, idx, finishesAt))
                      }
                    />
                  );
                })}
              </div>
            </TabItem>
          )}

          <TabItem title={<TabTitle label="Town Hall" count={
            (hv.townHallUpgrade && isActiveUpgrade(hv.townHallUpgrade.finishesAt) ? 1 : 0) +
            (hv.townHallWeaponUpgrade && isActiveUpgrade(hv.townHallWeaponUpgrade.finishesAt) ? 1 : 0)
          } />}>
            <TownHallTab
              hv={hv}
              thLevel={thLevel}
              slots={slots}
              onSave={save}
            />
          </TabItem>

          {thLevel >= 18 && (
            <TabItem title={<TabTitle label="Crafted" count={0} />}>
              <p className="mb-3 text-sm text-white/80">
                Module levels are set in{" "}
                <Link href="/mass-edit/home" className="text-accent underline">
                  Mass Edit
                </Link>
                .
              </p>
              <div className="flex flex-col gap-2">
                {craftedData.map((cd) => {
                  const saved = hv.craftedDefenses[cd.id];
                  return (
                    <div key={cd.id} className="overflow-hidden rounded-lg border border-secondary/80 bg-primary">
                      <div className="flex items-center gap-3 border-b border-secondary/80 px-3 py-2">
                        {cd.imageUrl && (
                          <div className="relative h-10 w-10 shrink-0">
                            <Image src={cd.imageUrl} alt={cd.name} fill className="object-contain" sizes="40px" />
                          </div>
                        )}
                        <span className="font-bold text-white">{cd.name}</span>
                      </div>
                      <div className="divide-y divide-secondary/80">
                        {cd.modules.map((mod, mi) => {
                          const currentLevel = saved?.modules[mi] ?? 0;
                          return (
                            <div key={mi} className="flex items-center gap-3 px-3 py-2">
                              <span className="flex-1 text-sm text-white/80">{mod.name}</span>
                              <span className="text-sm text-white/80">
                                Lvl {currentLevel}
                                <span className="text-white/80"> / {mod.maxLevel}</span>
                              </span>
                              {currentLevel >= mod.maxLevel && (
                                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-bold text-accent">
                                  Max
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabItem>
          )}

        </Tabs>
      </div>
    </div>
  );
}
