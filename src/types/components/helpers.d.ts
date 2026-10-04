import type { HomeVillageData } from "@/types/app/game";
import type { HelperAssignment } from "@/types/app/playthrough";

export interface ResourceSelectOption<T extends string = string> {
  value: T;
  label: string;
  image: string;
  color?: string;
}

export interface ResourceSelectProps<T extends string> {
  options: ResourceSelectOption<T>[];
  value: T;
  disabledValue?: T;
  label?: string;
  onChange: (value: T) => void;
}

export interface AlchemistCardProps {
  level: number | undefined;
  thLevel: number;
  onLevelChange: (level: number) => void;
}

export interface ProspectorCardProps {
  thLevel: number;
  prospectorUnlocked: boolean;
}

export interface HelperAssignmentCardProps {
  hv: HomeVillageData;
  level: number | undefined;
  assignment: HelperAssignment | undefined;
  thLevel: number;
  onLevelChange: (level: number) => void;
  onAssignmentChange: (assignment: HelperAssignment | undefined) => void;
}
