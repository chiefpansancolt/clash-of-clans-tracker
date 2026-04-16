"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TabItem, Tabs } from "flowbite-react";
import { toast } from "react-toastify";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { SliderRow } from "@/components/mass-edit/SliderRow";
import {
  getDefensesAtTH,
  getArmyBuildingsAtTH,
  getResourceBuildingsAtTH,
  getTrapsAtTH,
  getGuardiansAtTH,
  getTroopsAtTH,
  getSpellsAtTH,
  getSiegeMachinesAtTH,
  getPetsAtTH,
  getHeroesAtTH,
  getAllEquipment,
  getCraftedDefenses,
  getWallLevelsAtTH,
  type BuildingEditData,
  type ItemEditData,
} from "@/lib/utils/massEditHelpers";
import type { BuildingInstance, BuildingRecord, HomeVillageData, TrackedItem } from "@/types/app/game";

// ── Types ──────────────────────────────────────────────────────────────────────

type LevelMap = Record<string, number>;

// ── Flowbite Tabs theme — matches project colours ──────────────────────────────

const tabsTheme = {
  base: "flex flex-col h-full overflow-hidden",
  tablist: {
    base: "shrink-0 flex flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-secondary/80 bg-highlight px-4 py-3",
    variant: {
      pills: "gap-1",
    },
    tabitem: {
      base: "shrink-0 flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold first:ml-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40",
      variant: {
        pills: {
          base: "",
          active: {
            on: "bg-primary text-white",
            off: "bg-secondary/10 text-gray-900 hover:bg-secondary/20",
          },
        },
      },
    },
  },
  tabitemcontainer: {
    base: "flex-1 overflow-y-auto px-4",
    variant: { pills: "" },
  },
  tabpanel: "py-4",
};

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-1.5 border-b border-secondary/80 pb-1 text-[11px] font-bold uppercase tracking-widest text-gray-900">
      {children}
    </h3>
  );
}

// ── Building rows (defenses / army / resource / traps) ─────────────────────────

function BuildingTab({
  buildings,
  buildingLevels,
  superchargeLevels,
  onBuildingChange,
  onSuperchargeChange,
  sectionsInColumns = false,
}: {
  buildings: BuildingEditData[];
  buildingLevels: LevelMap;
  superchargeLevels: LevelMap;
  onBuildingChange: (key: string, val: number) => void;
  onSuperchargeChange: (key: string, val: number) => void;
  /** Put each building section (header + instances) into a 2-column grid */
  sectionsInColumns?: boolean;
}) {
  if (buildings.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">No buildings available at this Town Hall level.</p>;
  }

  function renderInstances(b: BuildingEditData) {
    return Array.from({ length: b.instanceCount }, (_, i) => {
      const instanceKey = `${b.id}-${i}`;
      const currentLevel = buildingLevels[instanceKey] ?? 0;
      const isMaxed = currentLevel >= b.maxLevel;
      return (
        <div key={i}>
          <SliderRow
            label={b.instanceCount > 1 ? `${b.name} #${i + 1}` : b.name}
            imageUrl={b.imageUrl}
            currentLevel={currentLevel}
            maxLevel={b.maxLevel}
            onChange={(val) => onBuildingChange(instanceKey, val)}
          />
          {b.superchargeTiers > 0 && (
            <SliderRow
              indent
              disabled={!isMaxed}
              label={b.instanceCount > 1 ? `Supercharge #${i + 1}` : "Supercharge"}
              imageUrl={b.imageUrl}
              currentLevel={superchargeLevels[instanceKey] ?? 0}
              maxLevel={b.superchargeTiers}
              onChange={(val) => onSuperchargeChange(instanceKey, val)}
            />
          )}
        </div>
      );
    });
  }

  if (sectionsInColumns) {
    return (
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 lg:grid-cols-2">
        {buildings.map((b) => (
          <div key={b.id}>
            <SectionHeader>
              {b.name}{b.instanceCount > 1 ? ` × ${b.instanceCount}` : ""}
            </SectionHeader>
            <div className="space-y-1">{renderInstances(b)}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {buildings.map((b) => (
        <div key={b.id} className="mt-6 first:mt-0">
          <SectionHeader>
            {b.name} × {b.instanceCount}
          </SectionHeader>
          <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
            {renderInstances(b)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Flat item rows (troops / spells / siege / pets) ────────────────────────────

function ItemTab({
  items,
  levelMap,
  onChange,
  emptyMsg,
}: {
  items: ItemEditData[];
  levelMap: LevelMap;
  onChange: (name: string, val: number) => void;
  emptyMsg?: string;
}) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">{emptyMsg ?? "Nothing available at this Town Hall level."}</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
      {items.map((item) => (
        <SliderRow
          key={item.name}
          label={item.name}
          imageUrl={item.imageUrl}
          currentLevel={levelMap[item.name] ?? 0}
          maxLevel={item.maxLevel}
          onChange={(val) => onChange(item.name, val)}
        />
      ))}
    </div>
  );
}

// ── Main page component ────────────────────────────────────────────────────────

export default function MassEditHomePage() {
  const { activePlaythrough, updatePlaythrough } = usePlaythrough();
  const router = useRouter();

  useEffect(() => {
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [activePlaythrough, router]);

  const thLevel = activePlaythrough?.data.homeVillage.townHallLevel ?? 1;

  // ── Game data (memoised per TH level) ────────────────────────────────────────
  const defenseData     = useMemo(() => getDefensesAtTH(thLevel),         [thLevel]);
  const armyData        = useMemo(() => getArmyBuildingsAtTH(thLevel),     [thLevel]);
  const resourceData    = useMemo(() => getResourceBuildingsAtTH(thLevel), [thLevel]);
  const trapData        = useMemo(() => getTrapsAtTH(thLevel),             [thLevel]);
  const guardianData    = useMemo(() => getGuardiansAtTH(thLevel),         [thLevel]);
  const troopData       = useMemo(() => getTroopsAtTH(thLevel),            [thLevel]);
  const spellData       = useMemo(() => getSpellsAtTH(thLevel),            [thLevel]);
  const siegeData       = useMemo(() => getSiegeMachinesAtTH(thLevel),     [thLevel]);
  const petData         = useMemo(() => getPetsAtTH(thLevel),              [thLevel]);
  const heroData        = useMemo(() => getHeroesAtTH(thLevel),            [thLevel]);
  const equipData       = useMemo(() => getAllEquipment(),                  []);
  const craftedData     = useMemo(() => thLevel >= 18 ? getCraftedDefenses() : [], [thLevel]);
  const wallInfo        = useMemo(() => getWallLevelsAtTH(thLevel),        [thLevel]);

  // ── Edit state ───────────────────────────────────────────────────────────────
  const [buildingLevels,    setBuildingLevels]    = useState<LevelMap>({});
  const [superchargeLevels, setSuperchargeLevels] = useState<LevelMap>({});
  const [troopLevels,       setTroopLevels]       = useState<LevelMap>({});
  const [spellLevels,       setSpellLevels]       = useState<LevelMap>({});
  const [siegeLevels,       setSiegeLevels]       = useState<LevelMap>({});
  const [petLevels,         setPetLevels]         = useState<LevelMap>({});
  const [heroLevels,        setHeroLevels]        = useState<LevelMap>({});
  const [equipLevels,       setEquipLevels]       = useState<LevelMap>({});
  const [craftedLevels,     setCraftedLevels]     = useState<LevelMap>({});
  const [wallCounts,        setWallCounts]        = useState<LevelMap>({});
  const [isDirty,           setIsDirty]           = useState(false);

  // ── Initialise from playthrough data ─────────────────────────────────────────
  useEffect(() => {
    if (!activePlaythrough) return;
    const hv = activePlaythrough.data.homeVillage;

    function initBuildings(editItems: BuildingEditData[], record: BuildingRecord) {
      const bLevels: LevelMap = {};
      const scLevels: LevelMap = {};
      for (const b of editItems) {
        const existing = record[b.id] ?? [];
        for (let i = 0; i < b.instanceCount; i++) {
          bLevels[`${b.id}-${i}`] = existing[i]?.level ?? 0;
          if (b.superchargeTiers > 0) {
            scLevels[`${b.id}-${i}`] = existing[i]?.superchargeLevel ?? 0;
          }
        }
      }
      return { bLevels, scLevels };
    }

    // Guardians are stored in hv.defenses
    const allBuildingData = [...defenseData, ...guardianData, ...armyData, ...resourceData, ...trapData];
    const allRecords: BuildingRecord = { ...hv.defenses, ...hv.armyBuildings, ...hv.resourceBuildings, ...hv.traps };
    const { bLevels, scLevels } = initBuildings(allBuildingData, allRecords);
    setBuildingLevels(bLevels);
    setSuperchargeLevels(scLevels);

    // Tracked items
    const toMap = (items: TrackedItem[]) => Object.fromEntries(items.map((t) => [t.name, t.level]));
    setTroopLevels(toMap(hv.troops));
    setSpellLevels(toMap(hv.spells));
    setSiegeLevels(toMap(hv.siegeMachines));
    setPetLevels(toMap(hv.pets));

    // Heroes
    setHeroLevels(Object.fromEntries(hv.heroes.map((h) => [h.name, h.level])));

    // Equipment — keyed by eq.name (globally unique)
    const eqMap: LevelMap = {};
    for (const hero of hv.heroes) {
      for (const eq of hero.equipment) {
        eqMap[eq.name] = eq.level;
      }
    }
    setEquipLevels(eqMap);

    // Crafted defenses
    if (thLevel >= 18) {
      const cMap: LevelMap = {};
      for (const cd of craftedData) {
        const tracked = hv.craftedDefenses[cd.id];
        cMap[`${cd.id}-0`] = tracked?.modules[0] ?? 0;
        cMap[`${cd.id}-1`] = tracked?.modules[1] ?? 0;
        cMap[`${cd.id}-2`] = tracked?.modules[2] ?? 0;
      }
      setCraftedLevels(cMap);
    }

    // Walls
    const wMap: LevelMap = {};
    for (const wl of wallInfo.levels) {
      wMap[String(wl.level)] = hv.walls[String(wl.level)] ?? 0;
    }
    setWallCounts(wMap);

    setIsDirty(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlaythrough?.id]);

  // ── Dirty setters ────────────────────────────────────────────────────────────
  function setBuilding(key: string, val: number) { setBuildingLevels((p) => ({ ...p, [key]: val })); setIsDirty(true); }
  function setSupercharge(key: string, val: number) { setSuperchargeLevels((p) => ({ ...p, [key]: val })); setIsDirty(true); }
  function setTroop(name: string, val: number) { setTroopLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }
  function setSpell(name: string, val: number) { setSpellLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }
  function setSiege(name: string, val: number) { setSiegeLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }
  function setPet(name: string, val: number) { setPetLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }
  function setHero(name: string, val: number) { setHeroLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }
  function setEquip(name: string, val: number) { setEquipLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }
  function setCrafted(key: string, val: number) { setCraftedLevels((p) => ({ ...p, [key]: val })); setIsDirty(true); }

  function setWall(levelStr: string, newCount: number) {
    setWallCounts((prev) => {
      const allocated = Object.values(prev).reduce((s, c) => s + c, 0);
      const current = prev[levelStr] ?? 0;
      const maxAllowable = wallInfo.totalAtTH - (allocated - current);
      const clamped = Math.max(0, Math.min(newCount, maxAllowable));
      return { ...prev, [levelStr]: clamped };
    });
    setIsDirty(true);
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  function handleSave() {
    if (!activePlaythrough) return;
    const hv = activePlaythrough.data.homeVillage;

    function rebuildRecord(editItems: BuildingEditData[], existing: BuildingRecord): BuildingRecord {
      const result: BuildingRecord = {};
      for (const b of editItems) {
        result[b.id] = [];
        for (let i = 0; i < b.instanceCount; i++) {
          const inst: BuildingInstance = {
            level: buildingLevels[`${b.id}-${i}`] ?? 0,
            upgrade: existing[b.id]?.[i]?.upgrade,
          };
          if (b.superchargeTiers > 0) {
            inst.superchargeLevel = superchargeLevels[`${b.id}-${i}`] ?? 0;
          }
          result[b.id].push(inst);
        }
      }
      return result;
    }

    function rebuildItems(editItems: ItemEditData[], levelMap: LevelMap, existing: TrackedItem[]): TrackedItem[] {
      return editItems.map((item) => ({
        name: item.name,
        level: levelMap[item.name] ?? 0,
        upgrade: existing.find((e) => e.name === item.name)?.upgrade,
      }));
    }

    // Guardians share defenses record
    const combinedDefenseData = [...defenseData, ...guardianData];

    const newHeroes = heroData.map((h) => {
      const existing = hv.heroes.find((e) => e.name === h.name);
      return {
        name: h.name,
        level: heroLevels[h.name] ?? 0,
        upgrade: existing?.upgrade,
        equipment: (existing?.equipment ?? []).map((eq) => ({
          name: eq.name,
          level: equipLevels[eq.name] ?? eq.level,
        })),
      };
    });

    const newCrafted: HomeVillageData["craftedDefenses"] = thLevel >= 18
      ? Object.fromEntries(
          craftedData.map((cd) => [
            cd.id,
            { modules: [craftedLevels[`${cd.id}-0`] ?? 0, craftedLevels[`${cd.id}-1`] ?? 0, craftedLevels[`${cd.id}-2`] ?? 0] as [number, number, number] },
          ])
        )
      : hv.craftedDefenses;

    const newWalls: Record<string, number> = {};
    for (const [lvl, count] of Object.entries(wallCounts)) {
      if (count > 0) newWalls[lvl] = count;
    }

    const newHV: HomeVillageData = {
      ...hv,
      defenses:          rebuildRecord(combinedDefenseData, hv.defenses),
      armyBuildings:     rebuildRecord(armyData,            hv.armyBuildings),
      resourceBuildings: rebuildRecord(resourceData,        hv.resourceBuildings),
      traps:             rebuildRecord(trapData,            hv.traps),
      troops:            rebuildItems(troopData,   troopLevels, hv.troops),
      spells:            rebuildItems(spellData,   spellLevels, hv.spells),
      siegeMachines:     rebuildItems(siegeData,   siegeLevels, hv.siegeMachines),
      pets:              rebuildItems(petData,     petLevels,   hv.pets),
      heroes:            newHeroes,
      craftedDefenses:   newCrafted,
      walls:             newWalls,
    };

    updatePlaythrough(activePlaythrough.id, {
      data: { ...activePlaythrough.data, homeVillage: newHV },
    });
    setIsDirty(false);
    toast.success("Home Village saved!");
    router.push("/dashboard");
  }

  // ── Walls summary ─────────────────────────────────────────────────────────────
  const allocated = Object.values(wallCounts).reduce((s, c) => s + c, 0);
  const remaining = wallInfo.totalAtTH - allocated;

  // ── Render ────────────────────────────────────────────────────────────────────
  if (!activePlaythrough) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Sticky page title ── */}
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Mass Edit — Home Village</h1>
          <span className="text-sm text-gray-500">TH{thLevel}</span>
          {isDirty && (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* ── Flowbite Tabs ── */}
      <div className="flex-1 overflow-hidden">
        <Tabs variant="pills" theme={tabsTheme}>

          {/* Defenses */}
          <TabItem title="Defenses">
            <BuildingTab
              buildings={defenseData}
              buildingLevels={buildingLevels}
              superchargeLevels={superchargeLevels}
              onBuildingChange={setBuilding}
              onSuperchargeChange={setSupercharge}
            />
          </TabItem>

          {/* Army */}
          <TabItem title="Army">
            <BuildingTab
              buildings={armyData}
              buildingLevels={buildingLevels}
              superchargeLevels={superchargeLevels}
              onBuildingChange={setBuilding}
              onSuperchargeChange={setSupercharge}
              sectionsInColumns
            />
          </TabItem>

          {/* Resources */}
          <TabItem title="Resources">
            <BuildingTab
              buildings={resourceData}
              buildingLevels={buildingLevels}
              superchargeLevels={superchargeLevels}
              onBuildingChange={setBuilding}
              onSuperchargeChange={setSupercharge}
            />
          </TabItem>

          {/* Traps */}
          <TabItem title="Traps">
            <BuildingTab
              buildings={trapData}
              buildingLevels={buildingLevels}
              superchargeLevels={superchargeLevels}
              onBuildingChange={setBuilding}
              onSuperchargeChange={setSupercharge}
            />
          </TabItem>

          {/* Troops */}
          <TabItem title="Troops">
            <ItemTab items={troopData} levelMap={troopLevels} onChange={setTroop} />
          </TabItem>

          {/* Spells */}
          <TabItem title="Spells">
            <ItemTab items={spellData} levelMap={spellLevels} onChange={setSpell} />
          </TabItem>

          {/* Siege */}
          <TabItem title="Siege">
            <ItemTab items={siegeData} levelMap={siegeLevels} onChange={setSiege} emptyMsg="Siege Machines unlock at TH12." />
          </TabItem>

          {/* Pets */}
          <TabItem title="Pets">
            <ItemTab items={petData} levelMap={petLevels} onChange={setPet} emptyMsg="Pets unlock at TH14." />
          </TabItem>

          {/* Guardians — TH18+ only, flat list */}
          {thLevel >= 18 && (
            <TabItem title="Guardians">
              <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
                {guardianData.map((g) => (
                  <SliderRow
                    key={g.id}
                    label={g.name}
                    imageUrl={g.imageUrl}
                    currentLevel={buildingLevels[`${g.id}-0`] ?? 0}
                    maxLevel={g.maxLevel}
                    onChange={(val) => setBuilding(`${g.id}-0`, val)}
                  />
                ))}
              </div>
            </TabItem>
          )}

          {/* Heroes */}
          <TabItem title="Heroes">
            <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
              {heroData.length === 0 ? (
                <p className="col-span-full py-6 text-center text-sm text-gray-400">No heroes available at this Town Hall level.</p>
              ) : (
                heroData.map((h) => (
                  <SliderRow
                    key={h.name}
                    label={h.name}
                    imageUrl={h.imageUrl}
                    currentLevel={heroLevels[h.name] ?? 0}
                    maxLevel={h.maxLevel}
                    onChange={(val) => setHero(h.name, val)}
                  />
                ))
              )}
            </div>
          </TabItem>

          {/* Equipment — grouped by hero */}
          <TabItem title="Equipment">
            {heroData.map((h) => {
              const heroEquip = equipData.filter((e) => e.heroId === h.id);
              if (heroEquip.length === 0) return null;
              return (
                <div key={h.id} className="mt-6 first:mt-0">
                  <SectionHeader>{h.name}</SectionHeader>
                  <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
                    {heroEquip.map((eq) => (
                      <SliderRow
                        key={eq.name}
                        label={eq.name}
                        imageUrl={eq.imageUrl}
                        currentLevel={equipLevels[eq.name] ?? 0}
                        maxLevel={eq.maxLevel}
                        onChange={(val) => setEquip(eq.name, val)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </TabItem>

          {/* Walls */}
          <TabItem title="Walls">
            <div>
              {/* Summary */}
              <div className="mb-4 flex items-center gap-4 rounded-xl border border-secondary/80 bg-white p-3">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-extrabold text-gray-900">{wallInfo.totalAtTH}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</span>
                </div>
                <div className="h-8 w-px bg-secondary/80" />
                <div className="flex flex-col items-center">
                  <span className="text-xl font-extrabold text-gray-900">{allocated}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Allocated</span>
                </div>
                <div className="h-8 w-px bg-secondary/80" />
                <div className="flex flex-col items-center">
                  <span className={`text-xl font-extrabold ${remaining === 0 ? "text-green-600" : remaining < 0 ? "text-action" : "text-amber-600"}`}>
                    {remaining}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Remaining</span>
                </div>
              </div>

              {/* Wall level rows */}
              <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
                {wallInfo.levels.map((wl) => (
                  <SliderRow
                    key={wl.level}
                    label={`Level ${wl.level}`}
                    imageUrl={wl.imageUrl}
                    currentLevel={wallCounts[String(wl.level)] ?? 0}
                    maxLevel={wallInfo.totalAtTH}
                    onChange={(val) => setWall(String(wl.level), val)}
                  />
                ))}
              </div>
            </div>
          </TabItem>

          {/* Crafted Defenses — TH18+ only */}
          {thLevel >= 18 && (
            <TabItem title="Crafted">
              <div>
                {craftedData.map((cd) => (
                  <div key={cd.id} className="mt-6 first:mt-0">
                    <SectionHeader>{cd.name}</SectionHeader>
                    <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
                      {cd.modules.map((mod, mi) => (
                        <SliderRow
                          key={mi}
                          label={mod.name}
                          imageUrl={cd.imageUrl}
                          currentLevel={craftedLevels[`${cd.id}-${mi}`] ?? 0}
                          maxLevel={mod.maxLevel}
                          onChange={(val) => setCrafted(`${cd.id}-${mi}`, val)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabItem>
          )}

        </Tabs>
      </div>

      {/* ── Save bar ── */}
      <div className="shrink-0 border-t border-secondary/80 bg-highlight px-4 py-3 flex items-center justify-end gap-3">
        <Button color="gray" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!isDirty}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
