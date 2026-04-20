import { achievements } from "clash-of-clans-data";
import type { TrackedAchievement } from "@/types/app/game";
import type { ProgressResult } from "@/lib/utils/progressHelpers";

const _achievements = achievements();

const makeResult = (current: number, max: number): ProgressResult => {
  if (max <= 0) return { current: 0, max: 0, pct: 0 };
  if (current >= max) return { current, max, pct: 100 };
  return { current, max, pct: Math.floor((current / max) * 100) };
};

// Maps package base string to app village string
const toAppVillage = (base: string): string => {
  if (base === "builder") return "builderBase";
  if (base === "clan-capital") return "clanCapital";
  return base; // "home" stays "home"
};

export interface NextStarRewards {
  xp: number;
  gems: number;
}

export const getNextStarRewards = (tracked: TrackedAchievement): NextStarRewards | null => {
  if (tracked.stars >= 3) return null;
  const pkg = _achievements.findByName(tracked.name);
  if (!pkg || tracked.stars >= pkg.tiers.length) return null;
  const tier = pkg.tiers[tracked.stars];
  return { xp: tier.xpRewarded, gems: tier.gemsRewarded };
};

/**
 * Builds the full authoritative achievement list from the package,
 * merged with any saved progress. All achievements are shown (even ones
 * the API doesn't return). Deduplication is handled naturally since the
 * package list has each achievement once.
 */
export const mergeWithPackageList = (saved: TrackedAchievement[]): TrackedAchievement[] => {
  const savedMap = new Map<string, TrackedAchievement>();
  for (const a of saved) {
    const key = `${a.name}::${a.village}`;
    const existing = savedMap.get(key);
    if (!existing || a.stars > existing.stars) {
      savedMap.set(key, a);
    }
  }

  return _achievements.get().map((pkg) => {
    const village = toAppVillage(pkg.base);
    const key = `${pkg.name}::${village}`;
    const entry = savedMap.get(key);
    if (entry) {
      // Fall back to package dataInvolved if no API info was stored yet
      return entry.info ? entry : { ...entry, info: pkg.dataInvolved };
    }
    return {
      name: pkg.name,
      stars: 0,
      value: 0,
      target: pkg.tiers[0]?.requirement ?? 1,
      village,
      info: pkg.dataInvolved,
    };
  });
};

/**
 * Merges freshly-fetched API achievements into the existing saved list,
 * preserving any entries the user has marked as manual (isManual: true).
 */
export const mergeApiAchievements = (
  fromApi: TrackedAchievement[],
  existing: TrackedAchievement[]
): TrackedAchievement[] => {
  const manualMap = new Map<string, TrackedAchievement>();
  for (const a of existing) {
    if (a.isManual) manualMap.set(`${a.name}::${a.village}`, a);
  }
  return fromApi.map((a) => manualMap.get(`${a.name}::${a.village}`) ?? a);
};

export const calcVillageStarProgress = (
  trackedAchievements: TrackedAchievement[],
  village: string
): ProgressResult => {
  const filtered = trackedAchievements.filter((a) => a.village === village);
  const current = filtered.reduce((sum, a) => sum + Math.min(a.stars, 3), 0);
  const max = filtered.length * 3;
  return makeResult(current, max);
};

export const calcTotalGemsCollected = (
  trackedAchievements: TrackedAchievement[]
): { collected: number; total: number } => {
  let collected = 0;
  let total = 0;
  for (const tracked of trackedAchievements) {
    const pkg = _achievements.findByName(tracked.name);
    if (!pkg) continue;
    const cappedStars = Math.min(tracked.stars, 3);
    const tierCount = Math.min(pkg.tiers.length, 3);
    for (let i = 0; i < tierCount; i++) {
      total += pkg.tiers[i].gemsRewarded;
      if (i < cappedStars) collected += pkg.tiers[i].gemsRewarded;
    }
  }
  return { collected, total };
};

export const calcTotalXpAvailable = (trackedAchievements: TrackedAchievement[]): number => {
  let xp = 0;
  for (const tracked of trackedAchievements) {
    const pkg = _achievements.findByName(tracked.name);
    if (!pkg) continue;
    const cappedStars = Math.min(tracked.stars, 3);
    const tierCount = Math.min(pkg.tiers.length, 3);
    for (let i = cappedStars; i < tierCount; i++) {
      xp += pkg.tiers[i].xpRewarded;
    }
  }
  return xp;
};
