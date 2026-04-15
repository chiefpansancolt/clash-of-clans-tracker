// Clash of Clans Player API response shape
// Mirrors the structure returned by GET /v1/players/{playerTag}

export interface PlayerApiTroop {
  name: string;
  level: number;
  maxLevel: number;
  village: string; // "home" | "builderBase" | "clanCapital"
}

export interface PlayerApiEquipment {
  name: string;
  level: number;
  maxLevel: number;
  village: string;
}

export interface PlayerApiHero {
  name: string;
  level: number;
  maxLevel: number;
  village: string;
  equipment?: PlayerApiEquipment[];
}

export interface PlayerApiSpell {
  name: string;
  level: number;
  maxLevel: number;
  village: string;
}

export interface PlayerApiAchievement {
  name: string;
  stars: number;
  value: number;
  target: number;
  info: string;
  completionInfo: string | null;
  village: string;
}

export interface PlayerApiLeague {
  id: number;
  name: string;
  iconUrls?: Record<string, string>;
}

export interface PlayerApiResponse {
  tag: string;
  name: string;
  townHallLevel: number;
  expLevel: number;
  trophies: number;
  bestTrophies: number;
  warStars: number;
  attackWins: number;
  defenseWins: number;
  builderHallLevel?: number;
  builderBaseTrophies?: number;
  bestBuilderBaseTrophies?: number;
  role?: string;
  warPreference?: string;
  clan?: { tag: string; name: string; clanLevel: number };
  donations: number;
  donationsReceived: number;
  clanCapitalContributions?: number;
  leagueTier?: PlayerApiLeague;
  builderBaseLeague?: { id: number; name: string };
  troops?: PlayerApiTroop[];
  spells?: PlayerApiSpell[];
  heroes?: PlayerApiHero[];
  achievements?: PlayerApiAchievement[];
}
