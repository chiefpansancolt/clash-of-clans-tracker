import type { DailyTimerData } from "@/types/app/playthrough";

export const getMostRecentReset = (resetTime: string): Date  => {
  const [h, m] = resetTime.split(":").map(Number);
  const candidate = new Date();
  candidate.setHours(h, m, 0, 0);
  if (candidate <= new Date()) return candidate;
  candidate.setDate(candidate.getDate() - 1);
  return candidate;
}

export const getNextReset = (resetTime: string): Date  => {
  const [h, m] = resetTime.split(":").map(Number);
  const candidate = new Date();
  candidate.setHours(h, m, 0, 0);
  if (candidate > new Date()) return candidate;
  candidate.setDate(candidate.getDate() + 1);
  return candidate;
}

export const isAvailable = (timer: DailyTimerData): boolean  => {
  if (!timer.resetTime || !timer.lastCollectedAt) return true;
  return new Date(timer.lastCollectedAt) < getMostRecentReset(timer.resetTime);
}

export const msUntilNextReset = (resetTime: string): number  => {
  return Math.max(0, getNextReset(resetTime).getTime() - Date.now());
}

export const formatCountdown = (ms: number): string  => {
  const totalSecs = Math.ceil(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
