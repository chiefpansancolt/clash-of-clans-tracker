import type { BuildingEditData } from "@/lib/utils/massEditHelpers";
import type { LevelMap } from "@/types/app/massEdit";
import { SectionHeader } from "@/components/mass-edit/SectionHeader";
import { SliderRow } from "@/components/mass-edit/SliderRow";

export function BuildingList({
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
