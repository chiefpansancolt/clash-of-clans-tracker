import type { AutoForgeData, DailyTimerData, ForgeResourceType, ForgeSlotData } from "@/types/app/playthrough";
import type { ConversionRate } from "@/lib/utils/forgeHelpers";

export interface CapitalGoldCardProps {
  timer: DailyTimerData;
  thLevel: number;
  onCollect: (resetTime: string | null) => void;
  onAdjust: (newResetTime: string) => void;
}

export interface ForgeSlotRowProps {
  label: string;
  slot: ForgeSlotData | AutoForgeData;
  isAuto?: boolean;
  locked?: boolean;
  unlocksTH?: number | null;
  rates: ConversionRate[];
  builderBoostPct: 0 | 10 | 15 | 20;
  thLevel: number;
  bhLevel: number;
  onStart: (resourceType: ForgeResourceType, rate: ConversionRate) => void;
  onStop: () => void;
}

export interface RateTableProps {
  title: string;
  rates: ConversionRate[];
}

export interface ConversionTablesProps {
  thLevel: number;
  bhLevel: number;
  autoForgeUnlocked: boolean;
}
