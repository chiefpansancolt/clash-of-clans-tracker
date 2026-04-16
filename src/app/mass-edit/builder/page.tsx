"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TabItem, Tabs } from "flowbite-react";
import { successToast } from "@/lib/notifications";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { SliderRow } from "@/components/mass-edit/SliderRow";
import {
  getBuilderDefensesAtBH,
  getBuilderArmyBuildingsAtBH,
  getBuilderResourceBuildingsAtBH,
  getBuilderTrapsAtBH,
  getBuilderTroopsAtBH,
  getBuilderHeroesAtBH,
  getBuilderWallLevelsAtBH,
} from "@/lib/utils/massEditBuilderHelpers";
import type {
  BuildingEditData,
  ItemEditData,
} from "@/lib/utils/massEditHelpers";
import type { BuilderBaseData, BuildingInstance, BuildingRecord, TrackedItem } from "@/types/app/game";

// ── Types ──────────────────────────────────────────────────────────────────────

type LevelMap = Record<string, number>;

// ── Flowbite Tabs theme ────────────────────────────────────────────────────────

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

// ── Bulk action bar ────────────────────────────────────────────────────────────

function BulkActions({ onMaxAll, onResetAll }: { onMaxAll: () => void; onResetAll: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onResetAll}
        className="cursor-pointer rounded-md border border-secondary/80 px-2.5 py-1 text-[11px] font-semibold text-gray-500 transition-colors hover:bg-secondary/10 hover:text-gray-700"
      >
        Reset All
      </button>
      <button
        type="button"
        onClick={onMaxAll}
        className="cursor-pointer rounded-md border border-secondary/80 bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-gray-700 transition-colors hover:bg-secondary/20"
      >
        Max All
      </button>
    </div>
  );
}

// ── Building rows ──────────────────────────────────────────────────────────────

function BuildingTab({
  buildings,
  buildingLevels,
  onBuildingChange,
  sectionsInColumns = false,
}: {
  buildings: BuildingEditData[];
  buildingLevels: LevelMap;
  onBuildingChange: (key: string, val: number) => void;
  sectionsInColumns?: boolean;
}) {
  if (buildings.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">No buildings available at this Builder Hall level.</p>;
  }

  function handleMaxAll() {
    for (const b of buildings) {
      for (let i = 0; i < b.instanceCount; i++) {
        onBuildingChange(`${b.id}-${i}`, b.maxLevel);
      }
    }
  }
  function handleResetAll() {
    for (const b of buildings) {
      for (let i = 0; i < b.instanceCount; i++) {
        onBuildingChange(`${b.id}-${i}`, 0);
      }
    }
  }

  function renderInstances(b: BuildingEditData) {
    return Array.from({ length: b.instanceCount }, (_, i) => {
      const instanceKey = `${b.id}-${i}`;
      return (
        <SliderRow
          key={i}
          label={b.instanceCount > 1 ? `${b.name} #${i + 1}` : b.name}
          imageUrl={b.imageUrl}
          currentLevel={buildingLevels[instanceKey] ?? 0}
          maxLevel={b.maxLevel}
          onChange={(val) => onBuildingChange(instanceKey, val)}
        />
      );
    });
  }

  if (sectionsInColumns) {
    return (
      <>
        <BulkActions onMaxAll={handleMaxAll} onResetAll={handleResetAll} />
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
      </>
    );
  }

  return (
    <>
      <BulkActions onMaxAll={handleMaxAll} onResetAll={handleResetAll} />
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
    </>
  );
}

// ── Flat item rows ─────────────────────────────────────────────────────────────

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
    return <p className="py-6 text-center text-sm text-gray-400">{emptyMsg ?? "Nothing available at this Builder Hall level."}</p>;
  }
  return (
    <>
      <BulkActions
        onMaxAll={() => items.forEach((item) => onChange(item.name, item.maxLevel))}
        onResetAll={() => items.forEach((item) => onChange(item.name, 0))}
      />
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
    </>
  );
}

// ── Main page component ────────────────────────────────────────────────────────

export default function MassEditBuilderPage() {
  const { activePlaythrough, updatePlaythrough, isLoaded } = usePlaythrough();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const bhLevel = activePlaythrough?.data.builderBase.builderHallLevel ?? 1;

  // ── Game data ────────────────────────────────────────────────────────────────
  const defenseData  = useMemo(() => getBuilderDefensesAtBH(bhLevel),       [bhLevel]);
  const armyData     = useMemo(() => getBuilderArmyBuildingsAtBH(bhLevel),  [bhLevel]);
  const resourceData = useMemo(() => getBuilderResourceBuildingsAtBH(bhLevel), [bhLevel]);
  const trapData     = useMemo(() => getBuilderTrapsAtBH(bhLevel),          [bhLevel]);
  const troopData    = useMemo(() => getBuilderTroopsAtBH(bhLevel),         [bhLevel]);
  const heroData     = useMemo(() => getBuilderHeroesAtBH(bhLevel),         [bhLevel]);
  const wallInfo     = useMemo(() => getBuilderWallLevelsAtBH(bhLevel),     [bhLevel]);

  // ── Edit state ───────────────────────────────────────────────────────────────
  const [buildingLevels, setBuildingLevels] = useState<LevelMap>({});
  const [troopLevels,    setTroopLevels]    = useState<LevelMap>({});
  const [heroLevels,     setHeroLevels]     = useState<LevelMap>({});
  const [wallCounts,     setWallCounts]     = useState<LevelMap>({});
  const [isDirty,        setIsDirty]        = useState(false);

  // ── Initialise ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activePlaythrough) return;
    const bb = activePlaythrough.data.builderBase;

    function initBuildings(editItems: BuildingEditData[], record: BuildingRecord) {
      const bLevels: LevelMap = {};
      for (const b of editItems) {
        const existing = record[b.id] ?? [];
        for (let i = 0; i < b.instanceCount; i++) {
          bLevels[`${b.id}-${i}`] = existing[i]?.level ?? 0;
        }
      }
      return bLevels;
    }

    const allBuildingData = [...defenseData, ...armyData, ...resourceData, ...trapData];
    const allRecords: BuildingRecord = {
      ...bb.defenses,
      ...bb.armyBuildings,
      ...bb.resourceBuildings,
      ...bb.traps,
    };
    setBuildingLevels(initBuildings(allBuildingData, allRecords));

    const toMap = (items: TrackedItem[]) => Object.fromEntries(items.map((t) => [t.name, t.level]));
    setTroopLevels(toMap(bb.troops));
    setHeroLevels(Object.fromEntries(bb.heroes.map((h) => [h.name, h.level])));

    const wMap: LevelMap = {};
    for (const wl of wallInfo.levels) {
      wMap[String(wl.level)] = bb.walls[String(wl.level)] ?? 0;
    }
    setWallCounts(wMap);

    setIsDirty(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlaythrough?.id]);

  // ── Navigation guard ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    const originalPushState = window.history.pushState.bind(window.history);
    window.history.pushState = function (state: unknown, title: string, url?: string | URL | null) {
      if (!window.confirm("You have unsaved changes. Leave without saving?")) return;
      originalPushState(state, title, url);
    };
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.history.pushState = originalPushState;
    };
  }, [isDirty]);

  // ── Dirty setters ────────────────────────────────────────────────────────────
  function setBuilding(key: string, val: number) { setBuildingLevels((p) => ({ ...p, [key]: val })); setIsDirty(true); }
  function setTroop(name: string, val: number) { setTroopLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }
  function setHero(name: string, val: number) { setHeroLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }

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
    const bb = activePlaythrough.data.builderBase;

    function rebuildRecord(editItems: BuildingEditData[], existing: BuildingRecord): BuildingRecord {
      const result: BuildingRecord = {};
      for (const b of editItems) {
        result[b.id] = [];
        for (let i = 0; i < b.instanceCount; i++) {
          const inst: BuildingInstance = {
            level: buildingLevels[`${b.id}-${i}`] ?? 0,
            upgrade: existing[b.id]?.[i]?.upgrade,
          };
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

    const newHeroes = heroData.map((h) => {
      const existing = bb.heroes.find((e) => e.name === h.name);
      return {
        name: h.name,
        level: heroLevels[h.name] ?? 0,
        upgrade: existing?.upgrade,
        equipment: existing?.equipment ?? [],
      };
    });

    const newWalls: Record<string, number> = {};
    for (const [lvl, count] of Object.entries(wallCounts)) {
      if (count > 0) newWalls[lvl] = count;
    }

    const newBB: BuilderBaseData = {
      ...bb,
      defenses:          rebuildRecord(defenseData,  bb.defenses),
      armyBuildings:     rebuildRecord(armyData,     bb.armyBuildings),
      resourceBuildings: rebuildRecord(resourceData, bb.resourceBuildings),
      traps:             rebuildRecord(trapData,     bb.traps),
      troops:            rebuildItems(troopData, troopLevels, bb.troops),
      heroes:            newHeroes,
      walls:             newWalls,
    };

    updatePlaythrough(activePlaythrough.id, {
      data: { ...activePlaythrough.data, builderBase: newBB },
    });
    setIsDirty(false);
    successToast({ message: "Builder Base saved!" });
    router.push("/dashboard");
  }

  // ── Walls summary ─────────────────────────────────────────────────────────────
  const allocated = Object.values(wallCounts).reduce((s, c) => s + c, 0);
  const remaining = wallInfo.totalAtTH - allocated;

  if (!activePlaythrough) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Sticky page title */}
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Mass Edit — Builder Base</h1>
          <span className="text-sm text-gray-500">BH{bhLevel}</span>
          {isDirty && (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="relative flex-1 overflow-hidden">
        {/* Fade hint for horizontal tab overflow */}
        <div className="pointer-events-none absolute top-0 right-0 z-10 h-13 w-12 bg-linear-to-l from-highlight to-transparent" />
        <Tabs variant="pills" theme={tabsTheme}>

          <TabItem title="Defenses">
            <BuildingTab
              buildings={defenseData}
              buildingLevels={buildingLevels}
              onBuildingChange={setBuilding}
            />
          </TabItem>

          <TabItem title="Army">
            <BuildingTab
              buildings={armyData}
              buildingLevels={buildingLevels}
              onBuildingChange={setBuilding}
              sectionsInColumns
            />
          </TabItem>

          <TabItem title="Resources">
            <BuildingTab
              buildings={resourceData}
              buildingLevels={buildingLevels}
              onBuildingChange={setBuilding}
            />
          </TabItem>

          <TabItem title="Traps">
            <BuildingTab
              buildings={trapData}
              buildingLevels={buildingLevels}
              onBuildingChange={setBuilding}
            />
          </TabItem>

          <TabItem title="Troops">
            <ItemTab items={troopData} levelMap={troopLevels} onChange={setTroop} />
          </TabItem>

          <TabItem title="Heroes">
            <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
              {heroData.length === 0 ? (
                <p className="col-span-full py-6 text-center text-sm text-gray-400">No heroes available at this Builder Hall level.</p>
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

          <TabItem title="Walls">
            <div>
              <div className="mb-4 flex items-center gap-4 rounded-xl border border-secondary/80 bg-highlight p-3">
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
              <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
                {wallInfo.levels.map((wl) => (
                  <SliderRow
                    key={wl.level}
                    label={`Level ${wl.level}`}
                    imageUrl={wl.imageUrl}
                    currentLevel={wallCounts[String(wl.level)] ?? 0}
                    maxLevel={wallInfo.totalAtTH}
                    onChange={(val) => setWall(String(wl.level), val)}
                    neverLocked
                  />
                ))}
              </div>
            </div>
          </TabItem>

        </Tabs>
      </div>

      {/* Save bar */}
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
