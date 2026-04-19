import type { BuilderQueueItem, ResearchQueueItem, PetQueueItem, QueueConflict, TimelineBlock, ResourceGroup } from "@/types/app/queue";
import type { HomeVillageData } from "@/types/app/game";
import type { BuilderSlot } from "@/types/app/upgrade";

export type PanelMode = "builder" | "research" | "pet";
export type BuilderCategory = "all" | "defenses" | "guardians" | "armyBuildings" | "resourceBuildings" | "traps" | "heroes" | "townHall" | "craftedDefenses" | "supercharges";
export type ResearchCategory = "all" | "troops" | "spells" | "siegeMachines";

export interface ActiveUpgradeWithControls {
  label: string;
  imageUrl: string;
  finishesAt: string;
  level: number;
  onFinish: () => void;
  onCancel: () => void;
  onAdjust: (finishesAt: string) => void;
}

export interface ActiveItemProps {
  upgrade: ActiveUpgradeWithControls;
  onRequestFinish: () => void;
  onRequestAdjust: () => void;
}

export interface PetActiveUpgrade {
  label: string;
  finishesAt: string;
}

export interface BuilderQueueCardProps {
  slot: BuilderSlot;
  queue: BuilderQueueItem[];
  activeUpgrade?: ActiveUpgradeWithControls;
  conflicts: QueueConflict[];
  multiInstanceBuildingIds?: Set<string>;
  onQueueChange: (newQueue: BuilderQueueItem[]) => void;
  onAddClick: (slotId: number) => void;
  onStartFirst?: (item: BuilderQueueItem) => void;
}

export interface ResearchQueueCardProps {
  slot: BuilderSlot;
  queue: ResearchQueueItem[];
  activeUpgrade?: ActiveUpgradeWithControls;
  conflicts: QueueConflict[];
  onQueueChange: (newQueue: ResearchQueueItem[]) => void;
  onAddClick: (slotId: number) => void;
  onStartFirst?: (item: ResearchQueueItem) => void;
}

export interface PetQueueCardProps {
  queue: PetQueueItem[];
  activeUpgrade?: PetActiveUpgrade;
  isBusy: boolean;
  conflicts: QueueConflict[];
  onQueueChange: (newQueue: PetQueueItem[]) => void;
  onAddClick: () => void;
}

export interface QueueItemProps {
  item: BuilderQueueItem | ResearchQueueItem | PetQueueItem;
  isConflict?: boolean;
  conflictMessage?: string;
  multiInstanceBuildingIds?: Set<string>;
  onRemove: () => void;
  onStart?: () => void;
}

export interface QueueTimelineProps {
  timeline: Record<string, TimelineBlock[]>;
  slots: BuilderSlot[];
  conflictItemIds?: Set<string>;
}

export interface HoveredBlock {
  block: TimelineBlock;
  x: number;
  y: number;
}

export interface ResourcePlannerModalProps {
  groups: ResourceGroup[];
  title?: string;
  onClose: () => void;
}

export interface AvailableBuilderItem {
  buildingId: string;
  instanceIndex: number;
  name: string;
  imageUrl: string;
  category: BuilderQueueItem["category"];
  currentLevel: number;
  nextLevel: number;
  cost: number;
  costResource: string;
  durationMs: number;
  isGuardian?: boolean;
  isCrafted?: boolean;
  isSupercharge?: boolean;
}

export interface AvailableResearchItem {
  name: string;
  imageUrl: string;
  category: ResearchQueueItem["category"];
  currentLevel: number;
  nextLevel: number;
  cost: number;
  costResource: string;
  durationMs: number;
  isUnlock: boolean;
}

export interface AvailablePetItem {
  name: string;
  imageUrl: string;
  currentLevel: number;
  nextLevel: number;
  cost: number;
  costResource: string;
  durationMs: number;
}

export interface BuilderPanelProps {
  hv: HomeVillageData;
  slots: BuilderSlot[];
  targetSlotId?: number;
  builderBoostPct?: 0 | 10 | 15 | 20;
  onAdd: (item: BuilderQueueItem, slotId: number) => void;
  onClose: () => void;
}

export interface ResearchPanelProps {
  hv: HomeVillageData;
  slots: BuilderSlot[];
  targetSlotId?: number;
  researchBoostPct?: 0 | 10 | 15 | 20;
  onAdd: (item: ResearchQueueItem, slotId: number) => void;
  onUnlock: (name: string, category: ResearchQueueItem["category"]) => void;
  onClose: () => void;
}

export interface PetPanelProps {
  hv: HomeVillageData;
  onAdd: (item: PetQueueItem) => void;
  onClose: () => void;
}

export interface ActiveUpgradeForSlot {
  label: string;
  imageUrl: string;
  finishesAt: string;
  level: number;
  onFinish: () => void;
  onCancel: () => void;
  onAdjust: (finishesAt: string) => void;
}
