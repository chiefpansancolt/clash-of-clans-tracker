"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
import { FiEdit2 } from "react-icons/fi";
import { formatTimeRemaining, formatBuildTime, formatFullNumber } from "@/lib/utils/upgradeHelpers";
import { FinishEarlyModal } from "@/components/upgrade/FinishEarlyModal";
import { AdjustTimeModal } from "@/components/upgrade/AdjustTimeModal";
import { QueueItem } from "@/components/upgrade/queue/QueueItem";
import type { ResearchQueueItem, QueueConflict } from "@/types/app/queue";
import type { ResearchQueueCardProps, ActiveItemProps } from "@/types/components/queue";

const RESOURCE_ICONS: Record<string, string> = {
  Gold: "/images/other/gold.png",
  Elixir: "/images/other/elixir.png",
  "Dark Elixir": "/images/other/dark-elixir.png",
  "Builder Gold": "/images/other/gold-b.png",
  "Builder Elixir": "/images/other/elixir-b.png",
  Gems: "/images/other/gem.png",
};

function resourceColorClass(resource: string) {
  if (resource === "Gold") return "text-accent";
  if (resource === "Dark Elixir") return "text-blue-300";
  return "text-purple-300";
}

function ActiveItem({ upgrade, onRequestFinish, onRequestAdjust }: ActiveItemProps) {
  const [countdown, setCountdown] = useState(() => formatTimeRemaining(upgrade.finishesAt));

  useEffect(() => {
    const id = setInterval(() => setCountdown(formatTimeRemaining(upgrade.finishesAt)), 1000);
    return () => clearInterval(id);
  }, [upgrade.finishesAt]);

  const parts = upgrade.label.split(/(\d+→\d+)/);
  const isReady = new Date(upgrade.finishesAt).getTime() <= Date.now();

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-secondary/80 bg-accent/5">
      <RiLockLine size={11} className="shrink-0 text-white/80" />
      {upgrade.imageUrl ? (
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
          <Image src={upgrade.imageUrl} alt={upgrade.label} fill className="object-contain" sizes="40px" />
        </div>
      ) : (
        <div className="h-10 w-10 shrink-0 rounded bg-white/6" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-white truncate">
          {parts[0]}<span className="text-accent">{parts[1]}</span>
        </p>
        <p className="text-[10px] text-white/80">{isReady ? "Ready!" : countdown}</p>
      </div>
      {isReady ? (
        <button
          onClick={upgrade.onFinish}
          className="cursor-pointer rounded-md bg-green-600 px-2.5 py-0.5 text-[10px] font-bold text-white hover:bg-green-500 transition-colors"
        >
          Collect
        </button>
      ) : (
        <div className="flex items-center gap-1">
          <button
            onClick={onRequestFinish}
            className="cursor-pointer rounded-md bg-accent/15 border border-accent/80 px-2 py-0.5 text-[10px] font-bold text-accent hover:bg-accent/25 transition-colors"
          >
            Finish
          </button>
          <button
            onClick={onRequestAdjust}
            className="cursor-pointer rounded p-1 text-white/80 hover:bg-white/10 transition-colors"
            title="Adjust time"
          >
            <FiEdit2 className="h-3 w-3" />
          </button>
          <button
            onClick={upgrade.onCancel}
            className="cursor-pointer rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-white/80 hover:bg-white/15 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export function ResearchQueueCard({ slot, queue, activeUpgrade, conflicts, onQueueChange, onAddClick, onStartFirst }: ResearchQueueCardProps) {
  const conflictIds = new Set(conflicts.map((c) => c.queueItemId));
  const conflictMap = new Map(conflicts.map((c) => [c.queueItemId, c.message]));
  const hasErrors = conflicts.length > 0;

  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);

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
      className={`w-full rounded-xl overflow-hidden ${
        hasErrors ? "border border-red-600/60" : "border border-secondary/80"
      } bg-primary/40`}
    >
      <div
        className={`flex items-center gap-2 px-3 py-2 border-b border-secondary/80 ${
          hasErrors ? "bg-red-900/12" : "bg-primary/60"
        }`}
      >
        <span className={`h-1.75 w-1.75 shrink-0 rounded-full ${slot.busy ? "bg-accent" : "bg-white/20"}`} />
        <span className="text-[12px] font-extrabold text-white">{slot.label}</span>
        <button
          onClick={() => onAddClick(slot.id)}
          className="ml-auto flex items-center gap-1 rounded-md border border-accent/80 bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent hover:bg-accent/20 cursor-pointer"
        >
          <RiAddLine size={11} />
          Add
        </button>
      </div>

      {activeUpgrade && (
        <>
          <ActiveItem
            upgrade={activeUpgrade}
            onRequestFinish={() => setFinishModalOpen(true)}
            onRequestAdjust={() => setAdjustModalOpen(true)}
          />
          <FinishEarlyModal
            isOpen={finishModalOpen}
            onClose={() => setFinishModalOpen(false)}
            onConfirm={() => { activeUpgrade.onFinish(); setFinishModalOpen(false); }}
            itemName={activeUpgrade.label}
            nextLevel={activeUpgrade.level + 1}
            timeRemaining={formatTimeRemaining(activeUpgrade.finishesAt)}
          />
          <AdjustTimeModal
            isOpen={adjustModalOpen}
            onClose={() => setAdjustModalOpen(false)}
            onConfirm={(f) => { activeUpgrade.onAdjust(f); setAdjustModalOpen(false); }}
            itemName={activeUpgrade.label}
            nextLevel={activeUpgrade.level + 1}
            currentFinishesAt={activeUpgrade.finishesAt}
          />
        </>
      )}

      {queue.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-3 py-6 text-center">
          <p className="text-[11px] text-white/80">No research queued</p>
          <button
            onClick={() => onAddClick(slot.id)}
            className="rounded-lg border border-accent/80 bg-accent/10 px-4 py-1.5 text-[11px] font-bold text-accent hover:bg-accent/20 cursor-pointer"
          >
            + Add Research
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
              {queue.map((item, idx) => (
                <QueueItem
                  key={item.id}
                  item={item}
                  isConflict={conflictIds.has(item.id)}
                  conflictMessage={conflictMap.get(item.id)}
                  onRemove={() => onQueueChange(queue.filter((i) => i.id !== item.id))}
                  onStart={!activeUpgrade && idx === 0 && onStartFirst ? () => onStartFirst(item) : undefined}
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
              <span className={`flex items-center gap-1 text-[13px] font-extrabold ${resourceColorClass(resource)}`}>
                {RESOURCE_ICONS[resource] && (
                  <span className="relative inline-block h-3.5 w-3.5 shrink-0">
                    <Image src={RESOURCE_ICONS[resource]} alt={resource} fill className="object-contain" sizes="14px" />
                  </span>
                )}
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
