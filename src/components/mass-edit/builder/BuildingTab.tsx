import type { BuildingEditData } from "@/lib/utils/massEditHelpers";
import type { LevelMap } from "@/types/app/massEdit";
import { BulkActions } from "@/components/mass-edit/BulkActions";
import { SectionHeader } from "@/components/mass-edit/SectionHeader";
import { SliderRow } from "@/components/mass-edit/SliderRow";

export function BuildingTab({
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
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        No buildings available at this Builder Hall level.
      </p>
    );
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
