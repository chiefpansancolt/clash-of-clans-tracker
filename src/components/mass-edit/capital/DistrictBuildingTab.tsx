"use client";

import { useState } from "react";
import type { BuildingEditData } from "@/lib/utils/massEditHelpers";
import type { CapitalWallInfo } from "@/lib/utils/massEditCapitalHelpers";
import type { LevelMap, DistrictSubTab } from "@/types/app/massEdit";
import { BulkActions } from "@/components/mass-edit/BulkActions";
import { HallLevelPicker } from "@/components/mass-edit/capital/HallLevelPicker";
import { BuildingList } from "@/components/mass-edit/capital/BuildingList";
import { GroupedBuildingList } from "@/components/mass-edit/capital/GroupedBuildingList";
import { WallsPanel } from "@/components/mass-edit/capital/WallsPanel";

export function DistrictBuildingTab({
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
              {activeTab === "buildings" ? (
                <GroupedBuildingList
                  districtId={districtId}
                  buildings={activeBuildings}
                  buildingLevels={buildingLevels}
                  onBuildingChange={onBuildingChange}
                />
              ) : (
                <BuildingList
                  districtId={districtId}
                  buildings={activeBuildings}
                  buildingLevels={buildingLevels}
                  onBuildingChange={onBuildingChange}
                />
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
