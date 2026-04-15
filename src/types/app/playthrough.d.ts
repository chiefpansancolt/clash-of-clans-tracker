import type { VillageData } from "./game";

export interface Playthrough {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO 8601
  lastModified: string; // ISO 8601
  /** ISO 8601 — set when TH level is assigned/changed; used for "Days at TH" counter */
  thChangedAt?: string;
  /** ISO 8601 — set when BH level is assigned/changed; used for "Days at BH" counter */
  bhChangedAt?: string;
  /** Whether the user has opted into tracking Clan Capital */
  clanCapitalEnabled?: boolean;
  data: VillageData;
}

export interface AppData {
  playthroughs: Playthrough[];
  activePlaythroughId: string | null;
}
