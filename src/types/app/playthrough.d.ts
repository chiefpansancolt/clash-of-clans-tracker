import type { VillageData } from "./game";

export interface DailyTimerData {
  /** "HH:MM" in local time; null = not yet configured */
  resetTime: string | null;
  /** ISO 8601; null = never collected this cycle */
  lastCollectedAt: string | null;
}

export interface GoldPassData {
  builderBoostPct: 0 | 10 | 15 | 20;
  researchBoostPct: 0 | 10 | 15 | 20;
  /** "YYYY-MM" — auto-reset when month changes */
  monthKey: string;
  hoggyBankUnlocked: boolean;
  gemDonationsUnlocked: boolean;
  autoForgeUnlocked: boolean;
  requestTimeReductionUnlocked: boolean;
}

export interface HelpersData {
  prospectorUnlocked: boolean;
  prospector: DailyTimerData;
  alchemist: DailyTimerData;
  buildersApprentice: DailyTimerData;
  labAssistant: DailyTimerData;
}

export type ForgeResourceType = "gold" | "elixir" | "darkElixir" | "builderGold" | "builderElixir";

export interface AutoForgeData {
  /** ISO 8601 — when the forge completes; null = not running */
  endsAt: string | null;
  /** Resource being converted */
  resourceType: ForgeResourceType;
  /** Amount of resource being converted (user-entered in Dailies bar) */
  resourceAmount: number;
  /** Capital Gold output */
  capitalGoldOutput: number;
  /** Effective duration in ms at start time (accounts for builder boost) */
  durationMs: number;
}

export interface ForgeSlotData {
  // null = slot idle
  resourceType: ForgeResourceType | null;
  /** ISO 8601; null = not running */
  endsAt: string | null;
  /** Effective duration in ms at start time (accounts for builder boost) */
  durationMs: number;
  /** Expected CG output (from package lookup at start time) */
  capitalGoldOutput: number;
  /** Resource cost (from package lookup at start time) */
  resourceCost: number;
}

export interface DailiesData {
  helpers: HelpersData;
  starBonus: DailyTimerData;
  capitalGold: DailyTimerData;
  goldPass: GoldPassData;
  autoForge: AutoForgeData;
  /** Always 4 stored; display count gated by TH level */
  forgeSlots: ForgeSlotData[];
}

export interface Playthrough {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lastModified: string;
  /** ISO 8601 — set when TH level is assigned/changed; used for "Days at TH" counter */
  thChangedAt?: string;
  /** ISO 8601 — set when BH level is assigned/changed; used for "Days at BH" counter */
  bhChangedAt?: string;
  /** Whether the user has opted into tracking Clan Capital */
  clanCapitalEnabled?: boolean;
  dailies?: DailiesData;
  data: VillageData;
}

export interface AppSettings {
  goblinBuilderEnabled: boolean;
  goblinResearchEnabled: boolean;
}

export interface AppData {
  playthroughs: Playthrough[];
  activePlaythroughId: string | null;
  settings?: AppSettings;
}

export type SortOption = "lastModified" | "name" | "createdAt";
