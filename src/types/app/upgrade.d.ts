export interface UpgradeStep {
  level: number;
  cost: number;
  costResource: string;
  buildTime: { days: number; hours: number; minutes: number; seconds: number };
  durationMs: number;
  imageUrl?: string;
  isSupercharge?: boolean;
}

export interface BuilderSlot {
  id: number;
  label: string;
  busy: boolean;
  finishesAt?: string;
}
