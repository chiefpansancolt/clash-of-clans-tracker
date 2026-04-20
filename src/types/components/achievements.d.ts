import type { TrackedAchievement } from "@/types/app/game";

export interface AchievementRowProps {
  tracked: TrackedAchievement;
  onUpdate: (updates: Partial<TrackedAchievement>) => void;
}

export interface AchievementSectionProps {
  title: string;
  achievements: TrackedAchievement[];
  onUpdate: (name: string, village: string, updates: Partial<TrackedAchievement>) => void;
}

export interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
}
