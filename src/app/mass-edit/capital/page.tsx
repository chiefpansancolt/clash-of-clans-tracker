"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TabItem, Tabs } from "flowbite-react";
import { successToast } from "@/lib/notifications";

import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { SliderRow } from "@/components/mass-edit/SliderRow";
import {
  getCapitalPeakBuildings,
  getDistrictBuildings,
  getCapitalPeakTraps,
  getDistrictTraps,
  getDistrictArmyBuildings,
  getCapitalPeakWalls,
  getDistrictWalls,
  getCapitalTroops,
  getCapitalSpells,
  getMaxCapitalHallLevel,
  getMaxDistrictHallLevel,
  type CapitalWallInfo,
} from "@/lib/utils/massEditCapitalHelpers";
import type { BuildingEditData, ItemEditData } from "@/lib/utils/massEditHelpers";
import type { CapitalBuildingRecord, ClanCapitalData, TrackedItem } from "@/types/app/game";

// ── Types ──────────────────────────────────────────────────────────────────────

type LevelMap = Record<string, number>;

// District IDs and labels (order matches user's tab list)
const DISTRICTS = [
  { id: "barbarianCamp",    label: "Barbarian Camp",       key: "barbarianCamp"    },
  { id: "wizardValley",     label: "Wizard Valley",        key: "wizardValley"     },
  { id: "balloonLagoon",    label: "Balloon Lagoon",       key: "balloonLagoon"    },
  { id: "buildersWorkshop", label: "Builder's Workshop",   key: "buildersWorkshop" },
  { id: "dragonCliffs",     label: "Dragon Cliffs",        key: "dragonCliffs"     },
  { id: "golemQuarry",      label: "Golem Quarry",         key: "golemQuarry"      },
  { id: "skeletonPark",     label: "Skeleton Park",        key: "skeletonPark"     },
  { id: "goblinMines",      label: "Goblin Mines",         key: "goblinMines"      },
] as const;

type DistrictKey = (typeof DISTRICTS)[number]["key"];

// Max levels (derived from data at module scope to avoid re-computation)
const MAX_CAPITAL_HALL = getMaxCapitalHallLevel();
const DISTRICT_MAX_LEVELS = Object.fromEntries(
  DISTRICTS.map((d) => [d.id, getMaxDistrictHallLevel(d.id)])
) as Record<string, number>;

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

// ── Hall level picker ──────────────────────────────────────────────────────────

function HallLevelPicker({
  label,
  level,
  maxLevel,
  onChange,
  allowZero = false,
}: {
  label: string;
  level: number;
  maxLevel: number;
  onChange: (level: number) => void;
  allowZero?: boolean;
}) {
  const levels = allowZero
    ? [0, ...Array.from({ length: maxLevel }, (_, i) => i + 1)]
    : Array.from({ length: maxLevel }, (_, i) => i + 1);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-secondary/80 bg-highlight px-3 py-2.5">
      <span className="shrink-0 text-[11px] font-bold uppercase tracking-widest text-gray-500">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {levels.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onChange(l)}
            className={`flex h-7 min-w-7 cursor-pointer items-center justify-center rounded-md px-1.5 text-xs font-bold transition-colors ${
              l === level
                ? "bg-primary text-white"
                : l === 0
                ? "bg-secondary/10 text-gray-400 hover:bg-secondary/20"
                : "bg-secondary/10 text-gray-700 hover:bg-secondary/20"
            }`}
          >
            {l === 0 ? "—" : l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Building rows ──────────────────────────────────────────────────────────────

type DistrictSubTab = "defenses" | "traps" | "buildings" | "walls";

function BuildingList({
  districtId,
  buildings,
  buildingLevels,
  onBuildingChange,
}: {
  districtId: string;
  buildings: BuildingEditData[];
  buildingLevels: LevelMap;
  onBuildingChange: (key: string, val: number) => void;
}) {
  if (buildings.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        Nothing available at this hall level.
      </p>
    );
  }
  return (
    <div>
      {buildings.map((b) => (
        <div key={b.id} className="mt-6 first:mt-0">
          <SectionHeader>
            {b.name}{b.instanceCount > 1 ? ` × ${b.instanceCount}` : ""}
          </SectionHeader>
          <div className="grid grid-cols-1 gap-1 lg:grid-cols-2">
            {Array.from({ length: b.instanceCount }, (_, i) => {
              const instanceKey = `${districtId}-${b.id}-${i}`;
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
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function WallsPanel({
  wallInfo,
  wallLevelCounts,
  onWallChange,
}: {
  wallInfo: CapitalWallInfo;
  wallLevelCounts: Record<string, number>;
  onWallChange: (level: string, count: number) => void;
}) {
  if (wallInfo.totalCount === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        No walls available at this hall level.
      </p>
    );
  }

  const allocated = Object.values(wallLevelCounts).reduce((s, c) => s + c, 0);
  const remaining = wallInfo.totalCount - allocated;

  return (
    <div>
      {/* Summary bar */}
      <div className="mb-4 flex items-center gap-4 rounded-xl border border-secondary/80 bg-highlight p-3">
        <div className="flex flex-col items-center">
          <span className="text-xl font-extrabold text-gray-900">{wallInfo.totalCount}</span>
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
            currentLevel={wallLevelCounts[String(wl.level)] ?? 0}
            maxLevel={wallInfo.totalCount}
            onChange={(val) => onWallChange(String(wl.level), val)}
            neverLocked
          />
        ))}
      </div>
    </div>
  );
}

function DistrictBuildingTab({
  districtId,
  defenseBuildings,
  trapBuildings,
  armyBuildings,
  wallInfo,
  buildingLevels,
  wallLevelCounts,
  onBuildingChange,
  onWallChange,
  dhLevel,
  maxHallLevel,
  onHallLevelChange,
  hallLabel,
}: {
  districtId: string;
  defenseBuildings: BuildingEditData[];
  trapBuildings: BuildingEditData[];
  armyBuildings: BuildingEditData[];
  wallInfo: CapitalWallInfo;
  buildingLevels: LevelMap;
  wallLevelCounts: Record<string, number>;
  onBuildingChange: (key: string, val: number) => void;
  onWallChange: (level: string, count: number) => void;
  dhLevel: number;
  maxHallLevel: number;
  onHallLevelChange: (level: number) => void;
  hallLabel: string;
}) {
  const [subTab, setSubTab] = useState<DistrictSubTab>("defenses");

  const tabs: { id: DistrictSubTab; label: string; show: boolean }[] = [
    { id: "defenses",  label: "Defenses",  show: dhLevel > 0 },
    { id: "traps",     label: "Traps",     show: dhLevel > 0 && trapBuildings.length > 0 },
    { id: "buildings", label: "Buildings", show: dhLevel > 0 && armyBuildings.length > 0 },
    { id: "walls",     label: "Walls",     show: dhLevel > 0 && wallInfo.totalCount > 0 },
  ];

  const visibleTabs = tabs.filter((t) => t.show);

  // If the current sub-tab is no longer visible (e.g. hall level dropped), fall back to defenses
  const activeTab = visibleTabs.find((t) => t.id === subTab) ? subTab : "defenses";

  const activeBuildings =
    activeTab === "defenses" ? defenseBuildings
    : activeTab === "traps" ? trapBuildings
    : armyBuildings;

  return (
    <>
      <HallLevelPicker
        label={hallLabel}
        level={dhLevel}
        maxLevel={maxHallLevel}
        onChange={onHallLevelChange}
        allowZero
      />

      {dhLevel === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          Set a {hallLabel} above to unlock buildings.
        </p>
      ) : (
        <>
          {/* Sub-tab toggle */}
          {visibleTabs.length > 1 && (
            <div className="mb-3 flex gap-1 rounded-lg border border-secondary/80 bg-highlight p-1 w-fit">
              {visibleTabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSubTab(t.id)}
                  className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    activeTab === t.id
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-secondary/10"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {activeTab === "walls" ? (
            <WallsPanel
              wallInfo={wallInfo}
              wallLevelCounts={wallLevelCounts}
              onWallChange={onWallChange}
            />
          ) : (
            <>
              <BulkActions
                onMaxAll={() => {
                  for (const b of activeBuildings) {
                    for (let i = 0; i < b.instanceCount; i++) {
                      onBuildingChange(`${districtId}-${b.id}-${i}`, b.maxLevel);
                    }
                  }
                }}
                onResetAll={() => {
                  for (const b of activeBuildings) {
                    for (let i = 0; i < b.instanceCount; i++) {
                      onBuildingChange(`${districtId}-${b.id}-${i}`, 0);
                    }
                  }
                }}
              />
              <BuildingList
                districtId={districtId}
                buildings={activeBuildings}
                buildingLevels={buildingLevels}
                onBuildingChange={onBuildingChange}
              />
            </>
          )}
        </>
      )}
    </>
  );
}

// ── Flat item rows ─────────────────────────────────────────────────────────────

function ItemTab({
  items,
  levelMap,
  onChange,
}: {
  items: ItemEditData[];
  levelMap: LevelMap;
  onChange: (name: string, val: number) => void;
}) {
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

export default function MassEditCapitalPage() {
  const { activePlaythrough, updatePlaythrough, isLoaded } = usePlaythrough();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const cc = activePlaythrough?.data.clanCapital;

  // ── Draft hall levels (editable) ─────────────────────────────────────────────
  const [capitalHallDraft, setCapitalHallDraft] = useState(() => cc?.capitalPeak.hallLevel ?? 0);
  const [districtHallDrafts, setDistrictHallDrafts] = useState<Record<string, number>>(
    () => Object.fromEntries(DISTRICTS.map((d) => [d.id, cc?.[d.key as DistrictKey].hallLevel ?? 0]))
  );

  // ── Game data (derived from draft hall levels) ────────────────────────────────
  const capitalPeakData = useMemo(
    () => getCapitalPeakBuildings(capitalHallDraft),
    [capitalHallDraft]
  );
  const districtBuildingData = useMemo(
    () => Object.fromEntries(
      DISTRICTS.map((d) => [d.id, getDistrictBuildings(d.id, districtHallDrafts[d.id] ?? 0)])
    ) as Record<string, BuildingEditData[]>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [capitalHallDraft, ...DISTRICTS.map((d) => districtHallDrafts[d.id])]
  );

  const districtArmyData = useMemo(
    () => Object.fromEntries(
      DISTRICTS.map((d) => [d.id, getDistrictArmyBuildings(d.id, districtHallDrafts[d.id] ?? 0)])
    ) as Record<string, BuildingEditData[]>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [capitalHallDraft, ...DISTRICTS.map((d) => districtHallDrafts[d.id])]
  );

  // Traps (separate data source from defenses)
  const capitalPeakTraps = useMemo(
    () => getCapitalPeakTraps(capitalHallDraft),
    [capitalHallDraft]
  );
  const districtTrapData = useMemo(
    () => Object.fromEntries(
      DISTRICTS.map((d) => [d.id, getDistrictTraps(d.id, districtHallDrafts[d.id] ?? 0)])
    ) as Record<string, BuildingEditData[]>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [capitalHallDraft, ...DISTRICTS.map((d) => districtHallDrafts[d.id])]
  );

  // Wall info per district
  const capitalPeakWallInfo = useMemo(
    () => getCapitalPeakWalls(capitalHallDraft),
    [capitalHallDraft]
  );
  const districtWallInfos = useMemo(
    () => Object.fromEntries(
      DISTRICTS.map((d) => [d.id, getDistrictWalls(d.id, districtHallDrafts[d.id] ?? 0)])
    ) as Record<string, CapitalWallInfo>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [capitalHallDraft, ...DISTRICTS.map((d) => districtHallDrafts[d.id])]
  );

  const troopData = useMemo(() => getCapitalTroops(), []);
  const spellData = useMemo(() => getCapitalSpells(), []);

  // ── Edit state ───────────────────────────────────────────────────────────────
  const [buildingLevels, setBuildingLevels] = useState<LevelMap>({});
  const [wallCounts,     setWallCounts]     = useState<Record<string, Record<string, number>>>({});
  const [troopLevels,    setTroopLevels]    = useState<LevelMap>({});
  const [spellLevels,    setSpellLevels]    = useState<LevelMap>({});
  const [isDirty,        setIsDirty]        = useState(false);

  // ── Initialise ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activePlaythrough) return;
    const cap = activePlaythrough.data.clanCapital;

    // Reset draft hall levels from fresh playthrough data
    setCapitalHallDraft(cap.capitalPeak.hallLevel);
    setDistrictHallDrafts(
      Object.fromEntries(DISTRICTS.map((d) => [d.id, cap[d.key as DistrictKey].hallLevel]))
    );

    const bLevels: LevelMap = {};

    function initDistrict(districtId: string, buildings: BuildingEditData[], record: CapitalBuildingRecord) {
      for (const b of buildings) {
        const existing = record[b.id] ?? [];
        for (let i = 0; i < b.instanceCount; i++) {
          bLevels[`${districtId}-${b.id}-${i}`] = existing[i] ?? 0;
        }
      }
    }

    // Capital Peak — defenses + traps
    const peakBuildings = getCapitalPeakBuildings(cap.capitalPeak.hallLevel);
    initDistrict("capitalPeak", peakBuildings, cap.capitalPeak.buildings);
    const peakTraps = getCapitalPeakTraps(cap.capitalPeak.hallLevel);
    initDistrict("capitalPeak", peakTraps, cap.capitalPeak.buildings);

    // Districts — defenses + traps + army buildings
    for (const d of DISTRICTS) {
      const dBuildings = getDistrictBuildings(d.id, cap[d.key as DistrictKey].hallLevel);
      initDistrict(d.id, dBuildings, cap[d.key as DistrictKey].buildings);
      const dTraps = getDistrictTraps(d.id, cap[d.key as DistrictKey].hallLevel);
      initDistrict(d.id, dTraps, cap[d.key as DistrictKey].buildings);
      const dArmy = getDistrictArmyBuildings(d.id, cap[d.key as DistrictKey].hallLevel);
      initDistrict(d.id, dArmy, cap[d.key as DistrictKey].buildings);
    }

    setBuildingLevels(bLevels);

    // Walls
    const wCounts: Record<string, Record<string, number>> = {};
    const peakWalls = getCapitalPeakWalls(cap.capitalPeak.hallLevel);
    wCounts["capitalPeak"] = Object.fromEntries(
      peakWalls.levels.map((wl) => [String(wl.level), cap.capitalPeak.walls?.[String(wl.level)] ?? 0])
    );
    for (const d of DISTRICTS) {
      const dWalls = getDistrictWalls(d.id, cap[d.key as DistrictKey].hallLevel);
      wCounts[d.id] = Object.fromEntries(
        dWalls.levels.map((wl) => [String(wl.level), cap[d.key as DistrictKey].walls?.[String(wl.level)] ?? 0])
      );
    }
    setWallCounts(wCounts);

    const toMap = (items: TrackedItem[]) => Object.fromEntries(items.map((t) => [t.name, t.level]));
    setTroopLevels(toMap(cap.troops));
    setSpellLevels(toMap(cap.spells));

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

  // ── Hall level change handlers ───────────────────────────────────────────────
  function handleCapitalHallChange(newLevel: number) {
    setCapitalHallDraft(newLevel);
    const newBuildings = getCapitalPeakBuildings(newLevel);
    const newTraps = getCapitalPeakTraps(newLevel);
    setBuildingLevels((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key.startsWith("capitalPeak-")) delete next[key];
      }
      for (const b of [...newBuildings, ...newTraps]) {
        for (let i = 0; i < b.instanceCount; i++) {
          next[`capitalPeak-${b.id}-${i}`] = 0;
        }
      }
      return next;
    });
    const newWalls = getCapitalPeakWalls(newLevel);
    setWallCounts((prev) => ({
      ...prev,
      capitalPeak: Object.fromEntries(newWalls.levels.map((wl) => [String(wl.level), 0])),
    }));
    setIsDirty(true);
  }

  function handleDistrictHallChange(districtId: string, newLevel: number) {
    setDistrictHallDrafts((prev) => ({ ...prev, [districtId]: newLevel }));
    const newDefenses = getDistrictBuildings(districtId, newLevel);
    const newTraps = getDistrictTraps(districtId, newLevel);
    const newArmy = getDistrictArmyBuildings(districtId, newLevel);
    setBuildingLevels((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key.startsWith(`${districtId}-`)) delete next[key];
      }
      for (const b of [...newDefenses, ...newTraps, ...newArmy]) {
        for (let i = 0; i < b.instanceCount; i++) {
          next[`${districtId}-${b.id}-${i}`] = 0;
        }
      }
      return next;
    });
    const newWalls = getDistrictWalls(districtId, newLevel);
    setWallCounts((prev) => ({
      ...prev,
      [districtId]: Object.fromEntries(newWalls.levels.map((wl) => [String(wl.level), 0])),
    }));
    setIsDirty(true);
  }

  // ── Dirty setters ────────────────────────────────────────────────────────────
  function setBuilding(key: string, val: number) { setBuildingLevels((p) => ({ ...p, [key]: val })); setIsDirty(true); }
  function setWall(districtId: string, level: string, count: number) {
    setWallCounts((p) => ({ ...p, [districtId]: { ...(p[districtId] ?? {}), [level]: count } }));
    setIsDirty(true);
  }
  function setTroop(name: string, val: number) { setTroopLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }
  function setSpell(name: string, val: number) { setSpellLevels((p) => ({ ...p, [name]: val })); setIsDirty(true); }

  // ── Save ─────────────────────────────────────────────────────────────────────
  function handleSave() {
    if (!activePlaythrough) return;
    const cap = activePlaythrough.data.clanCapital;

    function rebuildDistrictBuildings(
      districtId: string,
      buildings: BuildingEditData[]
    ): CapitalBuildingRecord {
      const result: CapitalBuildingRecord = {};
      for (const b of buildings) {
        result[b.id] = [];
        for (let i = 0; i < b.instanceCount; i++) {
          result[b.id].push(buildingLevels[`${districtId}-${b.id}-${i}`] ?? 0);
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

    const newCap: ClanCapitalData = {
      ...cap,
      capitalPeak: {
        hallLevel: capitalHallDraft,
        buildings: rebuildDistrictBuildings("capitalPeak", capitalPeakData),
        walls: wallCounts["capitalPeak"] ?? {},
      },
      ...Object.fromEntries(
        DISTRICTS.map((d) => [
          d.key,
          {
            hallLevel: districtHallDrafts[d.id] ?? 0,
            buildings: rebuildDistrictBuildings(
              d.id,
              districtBuildingData[d.id] ?? []
            ),
            walls: wallCounts[d.id] ?? {},
          },
        ])
      ),
      troops: rebuildItems(troopData, troopLevels, cap.troops),
      spells: rebuildItems(spellData, spellLevels, cap.spells),
    };

    updatePlaythrough(activePlaythrough.id, {
      data: { ...activePlaythrough.data, clanCapital: newCap },
    });
    setIsDirty(false);
    successToast({ message: "Clan Capital saved!" });
    router.push("/dashboard");
  }

  if (!activePlaythrough || !cc) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Sticky page title */}
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Mass Edit — Clan Capital</h1>
          <span className="text-sm text-gray-500">Capital Hall {capitalHallDraft}</span>
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

          {/* Capital Hall */}
          <TabItem title="Capital Hall">
            <DistrictBuildingTab
              districtId="capitalPeak"
              defenseBuildings={capitalPeakData}
              trapBuildings={capitalPeakTraps}
              armyBuildings={[]}
              wallInfo={capitalPeakWallInfo}
              buildingLevels={buildingLevels}
              wallLevelCounts={wallCounts["capitalPeak"] ?? {}}
              onBuildingChange={setBuilding}
              onWallChange={(level, count) => setWall("capitalPeak", level, count)}
              dhLevel={capitalHallDraft}
              maxHallLevel={MAX_CAPITAL_HALL}
              onHallLevelChange={handleCapitalHallChange}
              hallLabel="Capital Hall Level"
            />
          </TabItem>

          {/* District tabs */}
          {DISTRICTS.map((d) => (
            <TabItem key={d.id} title={d.label}>
              <DistrictBuildingTab
                districtId={d.id}
                defenseBuildings={districtBuildingData[d.id] ?? []}
                trapBuildings={districtTrapData[d.id] ?? []}
                armyBuildings={districtArmyData[d.id] ?? []}
                wallInfo={districtWallInfos[d.id] ?? { maxLevel: 0, totalCount: 0, levels: [] }}
                buildingLevels={buildingLevels}
                wallLevelCounts={wallCounts[d.id] ?? {}}
                onBuildingChange={setBuilding}
                onWallChange={(level, count) => setWall(d.id, level, count)}
                dhLevel={districtHallDrafts[d.id] ?? 0}
                maxHallLevel={DISTRICT_MAX_LEVELS[d.id] ?? 5}
                onHallLevelChange={(level) => handleDistrictHallChange(d.id, level)}
                hallLabel="District Hall Level"
              />
            </TabItem>
          ))}

          {/* Troops */}
          <TabItem title="Troops">
            <ItemTab items={troopData} levelMap={troopLevels} onChange={setTroop} />
          </TabItem>

          {/* Spells */}
          <TabItem title="Spells">
            <ItemTab items={spellData} levelMap={spellLevels} onChange={setSpell} />
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
