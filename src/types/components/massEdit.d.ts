export interface SliderRowProps {
  label: string;
  imageUrl: string;
  currentLevel: number;
  maxLevel: number;
  onChange: (newLevel: number) => void;
  /** Indented ⚡ supercharge row */
  indent?: boolean;
  /** Force-disable regardless of maxLevel (e.g. supercharge before max level) */
  disabled?: boolean;
  /** Suppress locked styling when 0 doesn't mean "not built" (e.g. wall counts) */
  neverLocked?: boolean;
}
