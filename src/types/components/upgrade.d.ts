import type { BuilderSlot, UpgradeStep } from "@/types/app/upgrade";
import type { UpgradeState } from "@/types/app/game";

export interface InstanceData {
  currentLevel: number;
  maxLevel: number;
  upgradeState?: UpgradeState;
}

export interface UpgradeRowProps {
  name: string;
  imageUrl: string;
  instances: InstanceData[];
  getAllSteps: (currentLevel: number, instanceIndex?: number) => UpgradeStep[];
  slots: BuilderSlot[];
  noQueue?: boolean;
  onStartUpgrade: (instanceIndex: number, step: UpgradeStep, builderId: number) => void;
  onFinishUpgrade: (instanceIndex: number) => void;
  onCancelUpgrade: (instanceIndex: number) => void;
  onAdjustUpgrade: (instanceIndex: number, finishesAt: string) => void;
}

export interface AdjustTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (finishesAt: string) => void;
  itemName: string;
  nextLevel: number;
  currentFinishesAt: string;
}

export type FinishMethod = "none" | "gems" | "book" | "hammer";

export interface FinishEarlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: FinishMethod) => void;
  itemName: string;
  nextLevel: number;
  timeRemaining: string;
}

export interface BuilderPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (builderId: number) => void;
  slots: BuilderSlot[];
  itemName: string;
  nextLevel: number;
  step: UpgradeStep;
}
