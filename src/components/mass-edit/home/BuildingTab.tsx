import type { BuildingEditData } from "@/lib/utils/massEditHelpers";
import type { LevelMap } from "@/types/app/massEdit";
import { BulkActions } from "@/components/mass-edit/BulkActions";
import { SectionHeader } from "@/components/mass-edit/SectionHeader";
import { SliderRow } from "@/components/mass-edit/SliderRow";

export const BuildingTab = ({
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
  sectionsInColumns?: boolean;
}) => {
  if (buildings.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        No buildings available at this Town Hall level.
      </p>
    );
  }

  const handleMaxAll = () => {
    for (const b of buildings) {
      for (let i = 0; i < b.instanceCount; i++) {
        onBuildingChange(`${b.id}-${i}`, b.maxLevel);
        if (b.superchargeTiers > 0) onSuperchargeChange(`${b.id}-${i}`, b.superchargeTiers);
      }
    }
  };

  const handleResetAll = () => {
    for (const b of buildings) {
      for (let i = 0; i < b.instanceCount; i++) {
        onBuildingChange(`${b.id}-${i}`, 0);
        if (b.superchargeTiers > 0) onSuperchargeChange(`${b.id}-${i}`, 0);
      }
    }
  };

  const renderInstances = (b: BuildingEditData) =>
    Array.from({ length: b.instanceCount }, (_, i) => {
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
};
