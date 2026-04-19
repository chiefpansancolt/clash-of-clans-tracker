// Minimal shapes for data objects returned by the clash-of-clans-data package.
// Fields are typed loosely (any[] for levels) to avoid coupling to package internals.

export type RawItem = { name: string; images: { icon?: string }; levels: any[] };

export type RawTroop = RawItem & { levels: Array<{ researchCostResource?: string }> };

export type RawLeague = { name: string; image: string };

export type RawResourceBuilding = {
  id: string;
  levels: Array<{
    level: number;
    capacity?: number;
    productionRate?: number;
    townHallRequired?: number;
    builderHallRequired?: number;
  }>;
};
