import type { ReactNode } from "react";
import type { BuilderBaseData, ClanCapitalData, HomeVillageData, TrackedHero, TrackedItem } from "@/types/app/game";
import type { AutoForgeData, DailiesData, DailyTimerData, GoldPassData, Playthrough } from "@/types/app/playthrough";
import type { ProgressResult } from "@/lib/utils/progressHelpers";

interface LootResources {
  goldAndElixir: number | null;
  darkElixir: number | null;
}

interface StarBonusResources extends LootResources {
  shinyOre: number | null;
  glowyOre: number | null;
  starryOre: number | null;
}

export interface HomeLeagueLoot {
  maxAvailableLoot: LootResources;
  maxLeagueBonus: LootResources;
  starBonus: StarBonusResources;
}

export interface HomeLeagueData {
  type: "home";
  name: string;
  image: string;
  attacksPerWeek: number | null;
  percentPromoted: number | null;
  percentDemoted: number | null;
  loot: HomeLeagueLoot | null;
}

export interface BuilderLeagueData {
  type: "builder";
  name: string;
  image: string;
  trophyMin: number | null;
  trophyMax: number | null;
  starBonus: { starsRequired: number; reward: number } | null;
  battleResults: Array<{ attackerGold: number; defenderElixir: number }>;
}

export type LeagueModalData = HomeLeagueData | BuilderLeagueData;

export interface LeagueRewardsModalProps {
  league: LeagueModalData | null;
  onClose: () => void;
}

export interface TimerChipProps {
  label: string;
  imageUrl: string;
  timer: DailyTimerData;
  onCollect: (resetTime: string | null) => void;
  onAdjust: (newResetTime: string) => void;
}

export type GoldPassItem =
  | { type: "pct"; label: string; image: string; value: 0 | 10 | 15 | 20 }
  | { type: "bool"; label: string; image: string; unlocked: boolean };

export interface AutoForgeChipProps {
  autoForge: AutoForgeData;
  onStop: () => void;
}

export interface DailiesSectionProps {
  dailies: DailiesData;
  playthroughId: string;
  thLevel: number;
  helperHutLevel: number;
  hv: HomeVillageData;
}

export interface PlayerHeaderProps {
  playthrough: Playthrough;
  achievementsProgress: ProgressResult;
}

export interface HeroCardProps {
  hero: TrackedHero;
  heroIconUrl: string;
  maxHeroLevel: number;
  getEquipmentData: (name: string) => { iconUrl: string; maxLevel: number } | undefined;
}

export interface SectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  queueHref?: string;
}

export interface ProgressCardProps {
  label: string;
  result: ProgressResult;
  sub?: string;
  queueHref?: string;
}

export interface ItemGridProps {
  items: TrackedItem[];
  getItemData: (name: string) => { iconUrl: string; maxLevel: number } | undefined;
  small?: boolean;
}

export interface BuilderBaseSectionProps {
  bb: BuilderBaseData;
  playthrough: Playthrough;
}

export interface HomeVillageSectionProps {
  hv: HomeVillageData;
  playthrough: Playthrough;
}

export interface ClanCapitalSectionProps {
  data: ClanCapitalData;
}
