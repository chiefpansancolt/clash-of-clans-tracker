import { clanCapital, calculators } from "clash-of-clans-data";
import type { ForgeResourceType } from "@/types/app/playthrough";

const _forge = clanCapital().forge();
const _craftingTime = _forge.craftingTime();

export const RESOURCE_META: Record<ForgeResourceType, { label: string; shortLabel: string; image: string }> = {
  gold:          { label: "Gold",          shortLabel: "Gold",     image: "images/other/gold.png" },
  elixir:        { label: "Elixir",        shortLabel: "Elixir",   image: "images/other/elixir.png" },
  darkElixir:    { label: "Dark Elixir",   shortLabel: "Dark",     image: "images/other/dark-elixir.png" },
  builderGold:   { label: "Builder Gold",  shortLabel: "B.Gold",   image: "images/other/gold-b.png" },
  builderElixir: { label: "Builder Elixir",shortLabel: "B.Elixir", image: "images/other/elixir-b.png" },
};

export const RESOURCE_ORDER: ForgeResourceType[] = [
  "gold", "elixir", "darkElixir", "builderGold", "builderElixir",
];

export function getForgeDurationMs(builderBoostPct: 0 | 10 | 15 | 20): number {
  // BoostTier is 10 | 15 | 20 — 0% means no reduction, return base 3-day duration
  if (builderBoostPct === 0) {
    return (_craftingTime.days ?? 3) * 86400 * 1000;
  }
  const boosted = calculators().boost().builderBoost(_craftingTime, builderBoostPct);
  return (
    ((boosted.days ?? 0) * 86400 +
      (boosted.hours ?? 0) * 3600 +
      (boosted.minutes ?? 0) * 60 +
      (boosted.seconds ?? 0)) *
    1000
  );
}

export function getForgeSlotCount(thLevel: number): number {
  return _forge.availableForgesAtTownHall(thLevel) ?? 0;
}

/** Returns the TH level at which slot index (1-based) unlocks, or null if always available. */
export function getForgeSlotUnlockTH(slotIndex: number): number | null {
  // Slot 1 unlocks at TH9, slot 2 at TH11, slot 3 at TH12, slot 4 at TH14
  const unlockMap: Record<number, number> = { 1: 9, 2: 11, 3: 12, 4: 14 };
  return unlockMap[slotIndex] ?? null;
}

export interface ConversionRate {
  resourceType: ForgeResourceType;
  resourceLabel: string;
  cost: number;
  capitalGold: number;
  /** Whether this resource is available at the given TH/BH level */
  available: boolean;
  requiresTH?: number;
  requiresBH?: number;
}

/** Manual forge rates for TH and BH resources at given levels */
export function getForgeRates(thLevel: number, bhLevel: number): ConversionRate[] {
  const rates: ConversionRate[] = [];

  const thData = _forge.forgeAtTownHall(thLevel);
  if (thData) {
    rates.push({
      resourceType: "gold",
      resourceLabel: "Gold",
      cost: thData.goldElixirCost,
      capitalGold: thData.capitalGoldObtained,
      available: true,
    });
    rates.push({
      resourceType: "elixir",
      resourceLabel: "Elixir",
      cost: thData.goldElixirCost,
      capitalGold: thData.capitalGoldObtained,
      available: true,
    });
    if (thData.darkElixirCost !== undefined) {
      rates.push({
        resourceType: "darkElixir",
        resourceLabel: "Dark Elixir",
        cost: thData.darkElixirCost,
        capitalGold: thData.capitalGoldObtained,
        available: thLevel >= 13,
        requiresTH: 13,
      });
    } else {
      // Show row as locked for < TH13
      rates.push({
        resourceType: "darkElixir",
        resourceLabel: "Dark Elixir",
        cost: 0,
        capitalGold: 0,
        available: false,
        requiresTH: 13,
      });
    }
  }

  const bhData = _forge.forgeAtBuilderHall(bhLevel);
  if (bhData) {
    rates.push({
      resourceType: "builderGold",
      resourceLabel: "Builder Gold",
      cost: bhData.builderGoldElixirCost,
      capitalGold: bhData.capitalGoldObtained,
      available: true,
    });
    rates.push({
      resourceType: "builderElixir",
      resourceLabel: "Builder Elixir",
      cost: bhData.builderGoldElixirCost,
      capitalGold: bhData.capitalGoldObtained,
      available: true,
    });
  } else {
    // Show builder rows as locked
    rates.push({
      resourceType: "builderGold",
      resourceLabel: "Builder Gold",
      cost: 0,
      capitalGold: 0,
      available: false,
      requiresBH: 8,
    });
    rates.push({
      resourceType: "builderElixir",
      resourceLabel: "Builder Elixir",
      cost: 0,
      capitalGold: 0,
      available: false,
      requiresBH: 8,
    });
  }

  return rates;
}

/** Auto Forge Gold Pass rates (reduced cost) for TH and BH resources */
export function getAutoForgeRates(thLevel: number, bhLevel: number): ConversionRate[] {
  const rates: ConversionRate[] = [];

  const thData = _forge.autoForgeAtTownHall(thLevel);
  if (thData) {
    const gpCost = thData.goldElixirCostGoldPass ?? 0;
    rates.push({
      resourceType: "gold",
      resourceLabel: "Gold",
      cost: gpCost,
      capitalGold: thData.capitalGoldObtained,
      available: true,
    });
    rates.push({
      resourceType: "elixir",
      resourceLabel: "Elixir",
      cost: gpCost,
      capitalGold: thData.capitalGoldObtained,
      available: true,
    });
    if (thData.darkElixirCostGoldPass !== undefined) {
      rates.push({
        resourceType: "darkElixir",
        resourceLabel: "Dark Elixir",
        cost: thData.darkElixirCostGoldPass,
        capitalGold: thData.capitalGoldObtained,
        available: thLevel >= 13,
        requiresTH: 13,
      });
    } else {
      rates.push({
        resourceType: "darkElixir",
        resourceLabel: "Dark Elixir",
        cost: 0,
        capitalGold: 0,
        available: false,
        requiresTH: 13,
      });
    }
  }

  const bhData = _forge.autoForgeAtBuilderHall(bhLevel);
  if (bhData) {
    const gpCostBh = bhData.builderGoldElixirCostGoldPass ?? 0;
    rates.push({
      resourceType: "builderGold",
      resourceLabel: "Builder Gold",
      cost: gpCostBh,
      capitalGold: bhData.capitalGoldObtained,
      available: true,
    });
    rates.push({
      resourceType: "builderElixir",
      resourceLabel: "Builder Elixir",
      cost: gpCostBh,
      capitalGold: bhData.capitalGoldObtained,
      available: true,
    });
  } else {
    rates.push({
      resourceType: "builderGold",
      resourceLabel: "Builder Gold",
      cost: 0,
      capitalGold: 0,
      available: false,
      requiresBH: 8,
    });
    rates.push({
      resourceType: "builderElixir",
      resourceLabel: "Builder Elixir",
      cost: 0,
      capitalGold: 0,
      available: false,
      requiresBH: 8,
    });
  }

  return rates;
}

export function getDailyForgeAmount(thLevel: number): number {
  return _forge.dailyForgeAtTownHall(thLevel)?.capitalGoldObtained ?? 0;
}

/** Format milliseconds remaining as "Xd Hh Mm Ss" */
export function formatForgeDuration(ms: number): string {
  if (ms <= 0) return "Done!";
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}
