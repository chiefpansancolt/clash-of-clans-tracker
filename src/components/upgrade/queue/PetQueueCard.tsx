"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { RiLockLine, RiAddLine } from "react-icons/ri";
import { formatTimeRemaining, formatFullNumber, formatBuildTime } from "@/lib/utils/upgradeHelpers";
import { QueueItem } from "@/components/upgrade/queue/QueueItem";
import type { PetQueueItem, QueueConflict } from "@/types/app/queue";
import type { PetQueueCardProps, PetActiveUpgrade } from "@/types/components/queue";

function ActiveItem({ upgrade }: { upgrade: PetActiveUpgrade }) {
  const [countdown, setCountdown] = useState(() => formatTimeRemaining(upgrade.finishesAt));

  useEffect(() => {
    const id = setInterval(() => setCountdown(formatTimeRemaining(upgrade.finishesAt)), 1000);
    return () => clearInterval(id);
  }, [upgrade.finishesAt]);

  return (
    <div className="px-3 py-2 border-b border-secondary/80 bg-accent/5">
      <div className="flex items-center gap-2">
        <RiLockLine size={11} className="shrink-0 text-white/80" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-white truncate">{upgrade.label}</p>
          <p className="text-[10px] text-accent font-bold">{countdown}</p>
        </div>
      </div>
    </div>
  );
}

export function PetQueueCard({ queue, activeUpgrade, isBusy, conflicts, onQueueChange, onAddClick }: PetQueueCardProps) {
  const conflictIds = new Set(conflicts.map((c) => c.queueItemId));
  const conflictMap = new Map(conflicts.map((c) => [c.queueItemId, c.message]));
  const hasErrors = conflicts.length > 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = queue.findIndex((i) => i.id === active.id);
    const newIdx = queue.findIndex((i) => i.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    onQueueChange(arrayMove(queue, oldIdx, newIdx));
  }

  const totalMs = queue.reduce((s, i) => s + i.durationMs, 0);
  const totalMinutes = Math.floor(totalMs / 60_000);
  const totalDuration = formatBuildTime({
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  });

  const resourceTotals = queue.reduce<Record<string, number>>((acc, item) => {
    acc[item.costResource] = (acc[item.costResource] ?? 0) + item.cost;
    return acc;
  }, {});

  return (
    <div
      className={`w-full max-w-md rounded-xl overflow-hidden ${
        hasErrors ? "border border-red-600/60" : "border border-secondary/80"
      } bg-primary/40`}
    >
      <div
        className={`flex items-center gap-2 px-3 py-2 border-b border-secondary/80 ${
          hasErrors ? "bg-red-900/12" : "bg-primary/60"
        }`}
      >
        <span className={`h-1.75 w-1.75 shrink-0 rounded-full ${isBusy ? "bg-accent" : "bg-white/20"}`} />
        <span className="text-[12px] font-extrabold text-white">Pet House</span>
        <button
          onClick={onAddClick}
          className="ml-auto flex items-center gap-1 rounded-md border border-accent/80 bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent hover:bg-accent/20 cursor-pointer"
        >
          <RiAddLine size={11} />
          Add
        </button>
      </div>

      {activeUpgrade && <ActiveItem upgrade={activeUpgrade} />}

      {queue.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-3 py-6 text-center">
          <p className="text-[11px] text-white/80">No pets queued</p>
          <button
            onClick={onAddClick}
            className="rounded-lg border border-accent/80 bg-accent/10 px-4 py-1.5 text-[11px] font-bold text-accent hover:bg-accent/20 cursor-pointer"
          >
            + Add Pet Upgrade
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={queue.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div>
              {queue.map((item) => (
                <QueueItem
                  key={item.id}
                  item={item}
                  isConflict={conflictIds.has(item.id)}
                  conflictMessage={conflictMap.get(item.id)}
                  onRemove={() => onQueueChange(queue.filter((i) => i.id !== item.id))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {queue.length > 0 && (
        <div className="flex flex-wrap gap-3 px-3 py-2 border-t border-secondary/80">
          <div className="flex flex-col">
            <span className="text-[13px] font-extrabold text-accent">{totalDuration}</span>
            <span className="text-[9px] font-bold uppercase tracking-wide text-white/80">Total Time</span>
          </div>
          {Object.entries(resourceTotals).map(([resource, amount]) => (
            <div key={resource} className="flex flex-col">
              <span className={`text-[13px] font-extrabold ${resource === "Dark Elixir" ? "text-blue-300" : "text-purple-300"}`}>
                {formatFullNumber(amount)}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-white/80">{resource}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
