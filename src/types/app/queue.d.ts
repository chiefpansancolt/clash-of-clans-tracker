// ─── Shared base ─────────────────────────────────────────────────────────────

interface BaseQueueItem {
  id: string;           // nanoid — stable key for drag-and-drop
  name: string;         // display name
  targetLevel: number;  // the level being upgraded to
  durationMs: number;   // from upgradeHelpers step
  cost: number;
  costResource: string; // "Gold" | "Elixir" | "Dark Elixir"
  imageUrl: string;
}

// ─── Builder queue ────────────────────────────────────────────────────────────

export interface BuilderQueueItem extends BaseQueueItem {
  category: "defenses" | "armyBuildings" | "resourceBuildings" | "traps" | "heroes" | "townHall" | "craftedDefenses";
  buildingId: string;    // clash-of-clans-data id e.g. "cannon"; for craftedDefenses: defenseId
  instanceIndex: number; // 0-based — which instance; for craftedDefenses: moduleIndex
  isSupercharge?: boolean;
}

// ─── Research queue ───────────────────────────────────────────────────────────

export interface ResearchQueueItem extends BaseQueueItem {
  category: "troops" | "spells" | "siegeMachines";
}

// ─── Pet queue ────────────────────────────────────────────────────────────────

export interface PetQueueItem extends BaseQueueItem {}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface QueueConflict {
  queueItemId: string;
  message: string; // e.g. "Cannon #1 lvl 14→15 must finish first"
}

// ─── Resource Planner ─────────────────────────────────────────────────────────

export interface ResourceEvent {
  builderLabel: string;   // "Builder 1" | "Laboratory"
  completingItem: string; // "Cannon #1  14→15"
  completesAt: Date;
  nextItem: string;       // "X-Bow #1  11→12"
  cost: number;
  costResource: string;
}

export interface ResourceGroup {
  dayOffset: number; // days from now, rounded
  date: Date;
  events: ResourceEvent[];
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export interface TimelineBlock {
  label: string;    // "Cannon #1  14→15"
  imageUrl: string;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  isIdle: boolean;
}
