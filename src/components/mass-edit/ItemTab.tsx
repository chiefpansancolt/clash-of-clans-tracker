import type { ItemEditData } from "@/lib/utils/massEditHelpers";
import type { LevelMap } from "@/types/app/massEdit";
import { BulkActions } from "@/components/mass-edit/BulkActions";
import { SliderRow } from "@/components/mass-edit/SliderRow";

export function ItemTab({
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
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        {emptyMsg ?? "Nothing available at this level."}
      </p>
    );
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
