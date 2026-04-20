"use client";

import Image from "next/image";
import { RiLockLine } from "react-icons/ri";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { getBuildersApprenticeData, getActiveBuilderUpgrades } from "@/lib/utils/helperHelpers";
import type { HomeVillageData } from "@/types/app/game";
import type { HelperAssignment } from "@/types/app/playthrough";

interface Props {
  hv: HomeVillageData;
  level: number | undefined;
  assignment: HelperAssignment | undefined;
  thLevel: number;
  onLevelChange: (level: number) => void;
  onAssignmentChange: (assignment: HelperAssignment | undefined) => void;
}

const formatSavedTime = (ms: number): string => {
  if (ms <= 0) return "0m";
  const totalMins = Math.floor(ms / 60_000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

export const BuildersApprenticeCard = ({ hv, level, assignment, thLevel, onLevelChange, onAssignmentChange }: Props) => {
  const levels = getBuildersApprenticeData();
  const minTH = 10;
  const locked = thLevel < minTH;
  const currentLevelData = level ? levels.find((l) => l.level === level) : null;
  const activeUpgrades = getActiveBuilderUpgrades(hv);

  const savedMs = currentLevelData ? currentLevelData.workRate * 3_600_000 : 0;

  const assignedLabel = assignment
    ? activeUpgrades.find((o) => JSON.stringify(o.target) === JSON.stringify(assignment.target))?.label ?? "Assigned (upgrade done)"
    : null;

  return (
    <div className={`rounded-xl border border-secondary/80 bg-primary overflow-hidden ${locked ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-secondary/80">
        <div className="relative h-10 w-10 shrink-0">
          <Image
            src={toPublicImageUrl("images/home/other/helpers/builders-apprentice/normal.png")}
            alt="Builder's Apprentice"
            fill
            sizes="40px"
            className="object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-white">Builder's Apprentice</p>
          {locked && (
            <p className="flex items-center gap-1 text-[10px] text-white/80">
              <RiLockLine size={10} /> Unlocks at TH{minTH}
            </p>
          )}
        </div>
      </div>

      {!locked && (
        <>
          <div className="px-4 py-3 border-b border-secondary/80">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-accent/80">Level</p>
            <div className="flex flex-wrap gap-1.5">
              {levels.map((l) => {
                const available = thLevel >= l.townHallRequired;
                return (
                  <div key={l.level} className="relative group">
                    <button
                      type="button"
                      disabled={!available}
                      onClick={() => onLevelChange(l.level)}
                      className={`rounded-full px-3 py-1 text-[10px] font-bold transition-colors border cursor-pointer ${
                        level === l.level
                          ? "bg-primary/80 border-accent/40 text-white"
                          : available
                          ? "bg-white/6 border-white/10 text-gray-600 hover:bg-white/10"
                          : "bg-white/4 border-white/10 text-white/30 cursor-not-allowed"
                      }`}
                    >
                      {l.level}
                    </button>
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 hidden group-hover:flex items-center gap-1 rounded-md bg-gray-900 px-2 py-1 shadow-lg whitespace-nowrap">
                      <span className="relative inline-block h-3 w-3 shrink-0">
                        <Image src="/images/other/gem.png" alt="Gems" fill className="object-contain" sizes="12px" />
                      </span>
                      <span className="text-[10px] text-white">{l.upgradeCost.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {currentLevelData && (
              <div className="mt-3 flex flex-col gap-1">
                <p className="text-[11px] text-white/80">
                  Saves: <span className="font-bold text-accent">{formatSavedTime(savedMs)}</span> per use
                </p>
              </div>
            )}
            {!currentLevelData && (
              <p className="mt-2 text-[11px] text-white/80">Select your level to see stats.</p>
            )}
          </div>

          <div className="px-4 py-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-accent/80">Assignment</p>

            {activeUpgrades.length === 0 ? (
              <p className="text-[11px] text-white/80">No active builder upgrades to assign.</p>
            ) : (
              <>
                <select
                  value={assignment ? JSON.stringify(assignment.target) : ""}
                  onChange={(e) => {
                    if (!e.target.value) { onAssignmentChange(undefined); return; }
                    const target = JSON.parse(e.target.value);
                    onAssignmentChange({ target, mode: assignment?.mode ?? "once" });
                  }}
                  className="w-full rounded-lg border border-secondary/80 bg-white/10 px-3 py-2 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-accent/80 cursor-pointer"
                >
                  <option value="">— None —</option>
                  {activeUpgrades.map((opt) => (
                    <option key={JSON.stringify(opt.target)} value={JSON.stringify(opt.target)}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {assignment && (
                  <div className="mt-2 flex gap-3">
                    {(["once", "continuous"] as const).map((mode) => (
                      <label key={mode} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="ba-mode"
                          checked={assignment.mode === mode}
                          onChange={() => onAssignmentChange({ ...assignment, mode })}
                          className="accent-amber-400 cursor-pointer"
                        />
                        <span className="text-[11px] text-white/80">
                          {mode === "once" ? "1-time use" : "Until done"}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}

            {assignedLabel && (
              <div className="mt-3 rounded-lg border border-accent/40 bg-accent/8 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-accent/80 mb-0.5">Assigned to</p>
                <p className="text-[11px] text-white font-semibold">{assignedLabel}</p>
                <p className="text-[10px] text-white/80">{assignment!.mode === "once" ? "Clears after 1 use" : "Stays until upgrade completes"}</p>
                <button
                  type="button"
                  onClick={() => onAssignmentChange(undefined)}
                  className="mt-1.5 text-[10px] text-white/80 hover:text-white cursor-pointer underline"
                >
                  Clear assignment
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
