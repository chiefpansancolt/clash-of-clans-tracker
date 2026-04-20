"use client";

import { useState } from "react";
import Image from "next/image";
import { HiCheck, HiPencil, HiStar, HiX } from "react-icons/hi";
import type { AchievementRowProps } from "@/types/components/achievements";
import { getNextStarRewards } from "@/lib/utils/achievementHelpers";

export const AchievementRow = ({ tracked, onUpdate }: AchievementRowProps) => {
  const [editing, setEditing] = useState(false);
  const [editStars, setEditStars] = useState(tracked.stars);
  const [editValue, setEditValue] = useState(String(tracked.value));
  const [editTarget, setEditTarget] = useState(String(tracked.target));
  const [editManual, setEditManual] = useState(tracked.isManual ?? false);

  const rewards = getNextStarRewards(tracked);
  const isMaxed = tracked.stars >= 3;
  const barPct = tracked.target > 0
    ? Math.min(100, Math.floor((tracked.value / tracked.target) * 100))
    : 0;

  const handleOpen = () => {
    setEditStars(tracked.stars);
    setEditValue(String(tracked.value));
    setEditTarget(String(tracked.target));
    setEditManual(tracked.isManual ?? false);
    setEditing(true);
  };

  const handleSave = () => {
    onUpdate({
      stars: editStars,
      value: Number(editValue) || 0,
      target: Number(editTarget) || 0,
      isManual: editManual,
    });
    setEditing(false);
  };

  return (
    <div className="border-b border-white/10 last:border-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-white/80">{tracked.name}</span>
            {tracked.isManual && (
              <span className="shrink-0 rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-white/10 text-white/50">
                manual
              </span>
            )}
          </div>
          {tracked.info && (
            <p className="mt-0.5 text-[11px] text-white/50 truncate">{tracked.info}</p>
          )}
        </div>

        {!isMaxed && rewards && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-0.5 text-[11px] font-semibold text-white/80">
              <span className="relative inline-block h-3.5 w-3.5 shrink-0">
                <Image src="/images/other/xp.png" alt="XP" fill className="object-contain" sizes="14px" />
              </span>
              {rewards.xp.toLocaleString()}
            </span>
            <span className="flex items-center gap-0.5 text-[11px] font-semibold text-white/80">
              <span className="relative inline-block h-3.5 w-3.5 shrink-0">
                <Image src="/images/other/gem.png" alt="Gems" fill className="object-contain" sizes="14px" />
              </span>
              {rewards.gems.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex items-center gap-0.5 shrink-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <HiStar key={i} className={`h-4 w-4 ${i < tracked.stars ? "text-accent" : "text-white/20"}`} />
          ))}
        </div>

        <div className="shrink-0 min-w-24 text-right">
          {isMaxed ? (
            <span className="text-[11px] font-semibold text-green-400">
              {tracked.value.toLocaleString()}
            </span>
          ) : (
            <>
              <div className="text-[11px] text-white/80 mb-1">
                {tracked.value.toLocaleString()} / {tracked.target.toLocaleString()}
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${barPct}%` }} />
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleOpen}
          className="shrink-0 cursor-pointer rounded p-1 text-white/40 hover:bg-white/10 hover:text-white/80 transition-colors"
          aria-label="Edit achievement"
        >
          <HiPencil className="h-3.5 w-3.5" />
        </button>
      </div>

      {editing && (
        <div className="pb-3 px-1">
          <div className="rounded-lg bg-white/5 p-3 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-[11px] text-white/50">Stars</span>
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setEditStars(editStars === i + 1 ? i : i + 1)}
                    className="cursor-pointer"
                  >
                    <HiStar className={`h-5 w-5 ${i < editStars ? "text-accent" : "text-white/20"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-[11px] text-white/50">Value</span>
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-28 rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-white focus:border-accent/80 focus:outline-none"
              />
              <span className="text-[11px] text-white/50">/</span>
              <input
                type="number"
                value={editTarget}
                onChange={(e) => setEditTarget(e.target.value)}
                className="w-28 rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-white focus:border-accent/80 focus:outline-none"
              />
              <span className="shrink-0 text-[11px] text-white/50">target</span>
            </div>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={editManual}
                onChange={(e) => setEditManual(e.target.checked)}
                className="h-3.5 w-3.5 rounded accent-accent"
              />
              <span className="text-[11px] text-white/80">Manual (skip API override)</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex cursor-pointer items-center gap-1 rounded bg-accent/20 px-2.5 py-1 text-[11px] font-semibold text-accent hover:bg-accent/30 transition-colors"
              >
                <HiCheck className="h-3.5 w-3.5" />
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex cursor-pointer items-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold text-white/50 hover:bg-white/10 transition-colors"
              >
                <HiX className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
