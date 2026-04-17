import type { CapitalWallInfo } from "@/lib/utils/massEditCapitalHelpers";
import { SliderRow } from "@/components/mass-edit/SliderRow";

export function WallsPanel({
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
