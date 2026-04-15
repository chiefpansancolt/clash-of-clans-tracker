import Image from "next/image";
import type { ClanCapitalData, ClanCapitalDistrictData } from "@/types/app/game";
import { ProgressCard } from "./ProgressCard";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import type { ProgressResult } from "@/lib/utils/progressHelpers";

const DISTRICTS: { key: keyof Omit<ClanCapitalData, "clanCapitalContributions">; label: string }[] = [
  { key: "capitalPeak", label: "Capital Peak" },
  { key: "barbarianCamp", label: "Barbarian Camp" },
  { key: "wizardValley", label: "Wizard Valley" },
  { key: "buildersWorkshop", label: "Builder's Workshop" },
  { key: "dragonCliffs", label: "Dragon Cliffs" },
  { key: "golemQuarry", label: "Golem Quarry" },
  { key: "skeletonPark", label: "Skeleton Park" },
  { key: "goblinMines", label: "Goblin Mines" },
];

function DistrictCard({ label, district, isCapital }: { label: string; district: ClanCapitalDistrictData; isCapital: boolean }) {
  const hallLevel = district.hallLevel;
  const imgUrl = isCapital
    ? toPublicImageUrl(`images/clan-capital/halls/capital-hall/normal/level-${hallLevel}.png`)
    : toPublicImageUrl(`images/clan-capital/halls/district-hall/normal/level-${Math.min(hallLevel, 5)}.png`);

  const hallLabel = isCapital ? `Capital Hall Lv ${hallLevel}` : `District Hall Lv ${hallLevel}`;

  // Building progress: sum of levels / (for each building, length of levels array × instance count)
  let current = 0;
  let max = 0;
  for (const levels of Object.values(district.buildings)) {
    for (const lvl of levels) {
      current += lvl;
      max += lvl; // We don't know true max without data lookup; show filled if all tracked
    }
  }
  // If no building data, show 0
  const hasBuildingData = max > 0;

  return (
    <div className="overflow-hidden rounded-lg border border-secondary/80 bg-primary">
      <div className="bg-secondary px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{label}</span>
      </div>
      <div className="flex items-center gap-3 p-3">
        <div className="relative h-12 w-12 shrink-0">
          <Image src={imgUrl} alt={label} fill sizes="48px" className="object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-white">{hallLabel}</div>
          {hasBuildingData ? (
            <>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-full rounded-full bg-accent" />
              </div>
              <div className="mt-1 text-[10px] text-white/80">Buildings tracked</div>
            </>
          ) : (
            <div className="mt-1 text-[10px] text-white/80">No building data</div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ClanCapitalSectionProps {
  data: ClanCapitalData;
}

export function ClanCapitalSection({ data }: ClanCapitalSectionProps) {
  const capitalHallLevel = data.capitalPeak.hallLevel;
  const capitalImageUrl = toPublicImageUrl(
    `images/clan-capital/halls/capital-hall/normal/level-${capitalHallLevel || 1}.png`
  );

  // Simple overall progress: count districts with hallLevel > 0
  const activeDistricts = DISTRICTS.filter((d) => data[d.key].hallLevel > 0).length;
  const districtsProg: ProgressResult = {
    current: activeDistricts,
    max: DISTRICTS.length,
    pct: Math.round((activeDistricts / DISTRICTS.length) * 100),
  };

  return (
    <section className="mb-8">
      {/* Section header */}
      <div className="mb-3 flex items-center gap-3 rounded-xl border border-secondary/80 bg-primary px-4 py-3">
        <div className="relative h-10 w-10 shrink-0">
          <Image src={capitalImageUrl} alt="Clan Capital" fill sizes="40px" className="object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-extrabold text-white leading-tight">Clan Capital</h2>
          <div className="text-xs text-white/80">
            Capital Hall {capitalHallLevel}
            {data.clanCapitalContributions > 0
              ? ` · ${data.clanCapitalContributions.toLocaleString()} contributions`
              : ""}
          </div>
        </div>
      </div>

      {/* Progress (2-col) */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <ProgressCard label="Districts" result={districtsProg} sub={`${activeDistricts} / ${DISTRICTS.length} active`} />
      </div>

      {/* District cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {DISTRICTS.map(({ key, label }) => (
          <DistrictCard
            key={key}
            label={label}
            district={data[key]}
            isCapital={key === "capitalPeak"}
          />
        ))}
      </div>
    </section>
  );
}
