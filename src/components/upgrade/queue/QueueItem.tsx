"use client";

import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RiDraggable, RiCloseLine } from "react-icons/ri";
import { formatFullNumber, formatBuildTime } from "@/lib/utils/upgradeHelpers";
import type { BuilderQueueItem, ResearchQueueItem, PetQueueItem } from "@/types/app/queue";

const RESOURCE_ICONS: Record<string, string> = {
  Gold: "/images/other/gold.png",
  Elixir: "/images/other/elixir.png",
  "Dark Elixir": "/images/other/dark-elixir.png",
  "Builder Gold": "/images/other/gold-b.png",
  "Builder Elixir": "/images/other/elixir-b.png",
  Gems: "/images/other/gem.png",
};

type AnyQueueItem = BuilderQueueItem | ResearchQueueItem | PetQueueItem;

interface Props {
  item: AnyQueueItem;
  isConflict?: boolean;
  conflictMessage?: string;
  multiInstanceBuildingIds?: Set<string>;
  onRemove: () => void;
  onStart?: () => void;
}

function ResourceIcon({ resource, cost }: { resource: string; cost: number }) {
  const icon = RESOURCE_ICONS[resource];
  return (
    <span className="flex items-center gap-0.5">
      {icon && (
        <span className="relative inline-block h-3 w-3 shrink-0">
          <Image src={icon} alt={resource} fill className="object-contain" sizes="12px" />
        </span>
      )}
      <span>{formatFullNumber(cost)}</span>
    </span>
  );
}

export function QueueItemOverlay({ item, multiInstanceBuildingIds }: { item: AnyQueueItem; multiInstanceBuildingIds?: Set<string> }) {
  const totalMinutes = Math.floor(item.durationMs / 60_000);
  const durationLabel = formatBuildTime({
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  });
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-accent/40 bg-primary shadow-xl opacity-95">
      {item.imageUrl ? (
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
          <Image src={item.imageUrl} alt={item.name} fill className="object-contain" sizes="40px" />
        </div>
      ) : (
        <div className="h-10 w-10 shrink-0 rounded bg-white/6" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-white truncate">
          {item.name}
          {"instanceIndex" in item && multiInstanceBuildingIds?.has((item as BuilderQueueItem).buildingId) ? ` #${(item as BuilderQueueItem).instanceIndex + 1}` : ""}{" "}
          {item.targetLevel - 1}→{item.targetLevel}
        </p>
        <p className="text-[10px] text-white/80">{durationLabel}</p>
      </div>
    </div>
  );
}

export function QueueItem({ item, isConflict, conflictMessage, multiInstanceBuildingIds, onRemove, onStart }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const totalMinutes = Math.floor(item.durationMs / 60_000);
  const durationLabel = formatBuildTime({
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-1.5 border-b border-secondary/25 last:border-b-0 ${
        isConflict ? "bg-red-900/20" : "bg-black/10"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab text-white/80 active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
      >
        <RiDraggable size={16} />
      </button>

      {item.imageUrl ? (
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
          <Image src={item.imageUrl} alt={item.name} fill className="object-contain" sizes="40px" />
        </div>
      ) : (
        <div className="h-10 w-10 shrink-0 rounded bg-white/6" />
      )}

      <div className="flex-1 min-w-0">
        <p
          className={`text-[11px] font-bold truncate ${
            isConflict ? "text-red-400" : "text-white"
          }`}
        >
          {item.name}
          {"instanceIndex" in item && multiInstanceBuildingIds?.has((item as BuilderQueueItem).buildingId) ? ` #${(item as BuilderQueueItem).instanceIndex + 1}` : ""}{" "}
          {item.targetLevel - 1}→{item.targetLevel}
        </p>
        <p className="text-[10px] text-white/80 flex items-center gap-1.5 flex-wrap">
          <ResourceIcon resource={item.costResource} cost={item.cost} />
          <span className="text-white/80">·</span>
          <span>{durationLabel}</span>
        </p>
        {isConflict && conflictMessage && (
          <p className="text-[9px] font-bold text-red-400 mt-0.5 flex items-center gap-1">
            <span>⚠</span>
            <span>{conflictMessage}</span>
          </p>
        )}
      </div>

      {onStart && (
        <button
          onClick={onStart}
          className="shrink-0 cursor-pointer rounded-md bg-accent px-2.5 py-0.5 text-[10px] font-bold text-primary hover:bg-accent/80 transition-colors"
        >
          {item.targetLevel === 1 ? "Build" : "Upgrade"}
        </button>
      )}
      <button
        onClick={onRemove}
        className="shrink-0 cursor-pointer text-white/30 hover:text-red-400 transition-colors"
        aria-label="Remove from queue"
      >
        <RiCloseLine size={16} />
      </button>
    </div>
  );
}
