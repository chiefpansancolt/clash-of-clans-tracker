import Image from "next/image";
import type { ClanCapitalData, ClanCapitalDistrictData } from "@/types/app/game";
import { ProgressCard } from "./ProgressCard";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import type { ProgressResult } from "@/lib/utils/progressHelpers";
import type { BuildingEditData } from "@/lib/utils/massEditHelpers";
import type { CapitalWallInfo } from "@/lib/utils/massEditCapitalHelpers";
import { HiLockClosed } from "react-icons/hi";
import {
  getCapitalPeakBuildings,
  getCapitalPeakTraps,
  getCapitalPeakWalls,
  getDistrictBuildings,
  getDistrictTraps,
  getDistrictArmyBuildings,
  getDistrictWalls,
  getCapitalTroops,
  getCapitalSpells,
  getDistrictUnlockLevels,
} from "@/lib/utils/massEditCapitalHelpers";

const DISTRICTS: { key: keyof Omit<ClanCapitalData, "clanCapitalContributions" | "troops" | "spells">; id: string; label: string }[] = [
  { key: "capitalPeak",      id: "capitalPeak",      label: "Capital Peak"       },
  { key: "barbarianCamp",    id: "barbarianCamp",    label: "Barbarian Camp"     },
  { key: "wizardValley",     id: "wizardValley",     label: "Wizard Valley"      },
  { key: "balloonLagoon",    id: "balloonLagoon",    label: "Balloon Lagoon"     },
  { key: "buildersWorkshop", id: "buildersWorkshop", label: "Builder's Workshop" },
  { key: "dragonCliffs",     id: "dragonCliffs",     label: "Dragon Cliffs"      },
  { key: "golemQuarry",      id: "golemQuarry",      label: "Golem Quarry"       },
  { key: "skeletonPark",     id: "skeletonPark",     label: "Skeleton Park"      },
  { key: "goblinMines",      id: "goblinMines",      label: "Goblin Mines"       },
];


function computeDistrictProgress(
  district: ClanCapitalDistrictData,
  buildings: BuildingEditData[],
  wallInfo: CapitalWallInfo
): ProgressResult {
  let current = 0;
  let max = 0;

  for (const b of buildings) {
    max += b.maxLevel * b.instanceCount;
    const saved = district.buildings[b.id] ?? [];
    for (let i = 0; i < b.instanceCount; i++) {
      current += saved[i] ?? 0;
    }
  }

  if (wallInfo.totalCount > 0 && wallInfo.maxLevel > 0) {
    max += wallInfo.totalCount * wallInfo.maxLevel;
    for (const [lvlStr, count] of Object.entries(district.walls ?? {})) {
      current += Number(lvlStr) * count;
    }
  }

  return {
    current,
    max,
    pct: max === 0 ? 0 : Math.round((current / max) * 100),
  };
}

function progressColor(pct: number): string {
  if (pct >= 100) return "bg-green-500";
  if (pct >= 80)  return "bg-blue-400";
  if (pct >= 60)  return "bg-accent";
  return "bg-orange-400";
}


function DistrictCard({
  label,
  district,
  isCapital,
  progress,
  unlocksAtCapitalHall,
}: {
  label: string;
  district: ClanCapitalDistrictData;
  isCapital: boolean;
  progress: ProgressResult;
  unlocksAtCapitalHall: number;
}) {
  const hallLevel = district.hallLevel;
  const isLocked = hallLevel === 0;

  if (isLocked) {
    return (
      <div className="overflow-hidden rounded-lg border border-secondary/80 bg-primary opacity-60">
        <div className="bg-secondary px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{label}</span>
        </div>
        <div className="flex items-center gap-3 p-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <HiLockClosed className="h-6 w-6 text-white/80" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white/80">Not Unlocked</div>
            <div className="mt-0.5 text-[10px] text-white/80">
              Unlocks at Capital Hall {unlocksAtCapitalHall}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const imgUrl = isCapital
    ? toPublicImageUrl(`images/clan-capital/halls/capital-hall/normal/level-${hallLevel}.png`)
    : toPublicImageUrl(`images/clan-capital/halls/district-hall/normal/level-${Math.min(hallLevel, 5)}.png`);
  const hallLabel = isCapital ? `Capital Hall Lv ${hallLevel}` : `District Hall Lv ${hallLevel}`;
  const trackColor = progressColor(progress.pct);

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
          {progress.max > 0 ? (
            <>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-sm font-extrabold text-accent">{progress.pct}%</span>
                <span className="text-[10px] text-white/80">
                  {progress.current.toLocaleString()} / {progress.max.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${trackColor}`}
                  style={{ width: `${progress.pct}%` }}
                />
              </div>
            </>
          ) : (
            <div className="mt-1 text-[10px] text-white/80">No data</div>
          )}
        </div>
      </div>
    </div>
  );
}

import type { ClanCapitalSectionProps } from "@/types/components/dashboard";

export function ClanCapitalSection({ data }: ClanCapitalSectionProps) {
  const capitalHallLevel = data.capitalPeak.hallLevel;
  const capitalImageUrl = toPublicImageUrl(
    `images/clan-capital/halls/capital-hall/normal/level-${capitalHallLevel || 1}.png`
  );

  const unlockLevels = getDistrictUnlockLevels();

  const districtHallLevels = Object.fromEntries(
    DISTRICTS.filter((d) => d.id !== "capitalPeak").map((d) => [
      d.id,
      (data[d.key] ).hallLevel,
    ])
  );

  const activeDistricts = DISTRICTS.filter((d) => data[d.key].hallLevel > 0).length;
  const districtsProg: ProgressResult = {
    current: activeDistricts,
    max: DISTRICTS.length,
    pct: Math.round((activeDistricts / DISTRICTS.length) * 100),
  };

  const availableTroops = getCapitalTroops(districtHallLevels);
  const troopsMax = availableTroops.reduce((s, t) => s + t.maxLevel, 0);
  const troopsCurrent = availableTroops.reduce((s, t) => {
    const saved = data.troops.find((tr) => tr.name === t.name);
    return s + (saved?.level ?? 0);
  }, 0);
  const troopsProg: ProgressResult = {
    current: troopsCurrent,
    max: troopsMax,
    pct: troopsMax === 0 ? 0 : Math.round((troopsCurrent / troopsMax) * 100),
  };

  const availableSpells = getCapitalSpells(districtHallLevels);
  const spellsMax = availableSpells.reduce((s, sp) => s + sp.maxLevel, 0);
  const spellsCurrent = availableSpells.reduce((s, sp) => {
    const saved = data.spells.find((sv) => sv.name === sp.name);
    return s + (saved?.level ?? 0);
  }, 0);
  const spellsProg: ProgressResult = {
    current: spellsCurrent,
    max: spellsMax,
    pct: spellsMax === 0 ? 0 : Math.round((spellsCurrent / spellsMax) * 100),
  };

  const capitalBuildings = [
    ...getCapitalPeakBuildings(capitalHallLevel),
    ...getCapitalPeakTraps(capitalHallLevel),
  ];
  const capitalWallInfo = getCapitalPeakWalls(capitalHallLevel);
  const capitalProgress = computeDistrictProgress(data.capitalPeak, capitalBuildings, capitalWallInfo);

  const districtProgresses = Object.fromEntries(
    DISTRICTS.filter((d) => d.id !== "capitalPeak").map((d) => {
      const dhLevel = (data[d.key] ).hallLevel;
      const buildings = [
        ...getDistrictBuildings(d.id, dhLevel),
        ...getDistrictTraps(d.id, dhLevel),
        ...getDistrictArmyBuildings(d.id, dhLevel),
      ];
      const wallInfo = getDistrictWalls(d.id, dhLevel);
      return [d.id, computeDistrictProgress(data[d.key] , buildings, wallInfo)];
    })
  ) as Record<string, ProgressResult>;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-3 rounded-xl border border-secondary/80 bg-primary px-4 py-3">
        <div className="relative h-10 w-10 shrink-0">
          <Image src={capitalImageUrl} alt="Clan Capital" fill sizes="40px" className="object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-extrabold text-white leading-tight">Clan Capital</h2>
          <div className="text-xs text-white/80">Capital Hall {capitalHallLevel}</div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <ProgressCard label="Districts" result={districtsProg} sub={`${activeDistricts} / ${DISTRICTS.length} active`} />
        <ProgressCard label="Troops" result={troopsProg} sub={`${availableTroops.length} available`} />
        <ProgressCard label="Spells" result={spellsProg} sub={`${availableSpells.length} available`} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <DistrictCard
          label="Capital Peak"
          district={data.capitalPeak}
          isCapital
          progress={capitalProgress}
          unlocksAtCapitalHall={1}
        />
        {DISTRICTS.filter((d) => d.id !== "capitalPeak").map(({ key, id, label }) => (
          <DistrictCard
            key={id}
            label={label}
            district={data[key]}
            isCapital={false}
            progress={districtProgresses[id] ?? { current: 0, max: 0, pct: 0 }}
            unlocksAtCapitalHall={unlockLevels[id] ?? 1}
          />
        ))}
      </div>
    </section>
  );
}
