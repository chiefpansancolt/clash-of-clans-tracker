"use client";

import { useState } from "react";
import { HiChevronDown, HiChevronRight } from "react-icons/hi";
import { AchievementRow } from "./AchievementRow";
import type { AchievementSectionProps } from "@/types/components/achievements";

export const AchievementSection = ({ title, achievements, onUpdate }: AchievementSectionProps) => {
  const [collapsed, setCollapsed] = useState(false);

  if (achievements.length === 0) return null;

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-secondary/80">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full cursor-pointer items-center bg-secondary px-3 py-2.5"
      >
        <span className="flex-1 text-left text-sm font-bold uppercase tracking-widest text-accent">
          {title}
        </span>
        {collapsed ? (
          <HiChevronRight className="h-4 w-4 shrink-0 text-accent" />
        ) : (
          <HiChevronDown className="h-4 w-4 shrink-0 text-accent" />
        )}
      </button>

      {!collapsed && (
        <div className="bg-primary p-3">
          {achievements.map((tracked, i) => (
            <AchievementRow
              key={`${tracked.name}-${i}`}
              tracked={tracked}
              onUpdate={(updates) => onUpdate(tracked.name, tracked.village, updates)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
