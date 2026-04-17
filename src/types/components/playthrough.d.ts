import type { Playthrough } from "@/types/app/playthrough";

export interface NotFoundCardProps {
  title?: string;
  message?: string;
}

export interface LoadingPlaythroughProps {
  message?: string;
}

export interface PlaythroughCardProps {
  playthrough: Playthrough;
}
