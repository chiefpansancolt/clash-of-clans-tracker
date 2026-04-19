"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { RiLockLine, RiAddLine } from "react-icons/ri";
import { LabelWithArrow } from "@/components/common/LabelWithArrow";
import { FiEdit2 } from "react-icons/fi";
import { formatTimeRemaining, formatFullNumber, formatBuildTime, getGemCost } from "@/lib/utils/upgradeHelpers";
import { FinishEarlyModal } from "@/components/upgrade/FinishEarlyModal";
import { AdjustTimeModal } from "@/components/upgrade/AdjustTimeModal";

const RESOURCE_ICONS: Record<string, string> = {
  Gold: "/images/other/gold.png",
  Elixir: "/images/other/elixir.png",
  "Dark Elixir": "/images/other/dark-elixir.png",
  "Builder Gold": "/images/other/gold-b.png",
  "Builder Elixir": "/images/other/elixir-b.png",
  Gems: "/images/other/gem.png",
};
import { QueueItem } from "@/components/upgrade/queue/QueueItem";
import type { BuilderQueueCardProps, ActiveItemProps } from "@/types/components/queue";

const resourceColorClass = (resource: string) => {
  if (resource === "Gold") return "text-accent";
  if (resource === "Dark Elixir") return "text-blue-300";
  return "text-purple-300";
}

const ResourceFooterTotal = ({ resource, amount }: { resource: string; amount: number }) => {
  const icon = RESOURCE_ICONS[resource];
  return (
    <div className="flex flex-col">
      <span className={`flex items-center gap-1 text-[13px] font-extrabold ${resourceColorClass(resource)}`}>
        {icon && (
          <span className="relative inline-block h-3.5 w-3.5 shrink-0">
            <Image src={icon} alt={resource} fill className="object-contain" sizes="14px" />
          </span>
        )}
        {formatFullNumber(amount)}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-wide text-white/80">{resource}</span>
    </div>
  );
}

const ActiveItem = ({ upgrade, onRequestFinish, onRequestAdjust }: ActiveItemProps) => {
  const [countdown, setCountdown] = useState(() => formatTimeRemaining(upgrade.finishesAt));
  const [isReady, setIsReady] = useState(() => new Date(upgrade.finishesAt).getTime() <= Date.now());
  const [gemCost, setGemCost] = useState(() => getGemCost(Math.max(0, new Date(upgrade.finishesAt).getTime() - Date.now())));

  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, new Date(upgrade.finishesAt).getTime() - Date.now());
      setCountdown(formatTimeRemaining(upgrade.finishesAt));
      setIsReady(remaining <= 0);
      setGemCost(getGemCost(remaining));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [upgrade.finishesAt]);

  const parts = upgrade.label.split(/(\d+→\d+)/);

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
          {parts[0]}<span className="text-accent"><LabelWithArrow label={parts[1] ?? ""} /></span>
        </p>
        <p className="text-[10px] text-white/80 flex items-center gap-1.5">
          {isReady ? "Ready!" : countdown}
          {!isReady && (
            <span className="flex items-center gap-0.5 text-accent">
              <span className="relative inline-block h-3 w-3 shrink-0">
                <Image src={RESOURCE_ICONS.Gems} alt="Gems" fill className="object-contain" sizes="12px" />
              </span>
              {gemCost.toLocaleString()}
            </span>
          )}
        </p>
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

export const BuilderQueueCard = ({ slot, queue, activeUpgrade, conflicts, multiInstanceBuildingIds, onQueueChange, onAddClick, onStartFirst }: BuilderQueueCardProps) => {
  const conflictIds = new Set(conflicts.map((c) => c.queueItemId));
  const conflictMap = new Map(conflicts.map((c) => [c.queueItemId, c.message]));
  const hasErrors = conflicts.length > 0;

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `container-${slot.id}` });

  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);

  const removeItem = (id: string)=> {
    onQueueChange(queue.filter((i) => i.id !== id));
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
        hasErrors
          ? "border border-red-600/60"
          : "border border-secondary/80"
      } bg-primary`}
    >
      <div
        className={`flex items-center gap-2 px-3 py-2 border-b border-secondary/80 ${
          hasErrors ? "bg-red-900/12" : "bg-primary"
        }`}
      >
        <span
          className={`h-1.75 w-1.75 shrink-0 rounded-full ${
            slot.busy ? "bg-accent" : "bg-white/20"
          }`}
        />
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
            onConfirm={(finishesAt) => { activeUpgrade.onAdjust(finishesAt); setAdjustModalOpen(false); }}
            itemName={activeUpgrade.label}
            nextLevel={activeUpgrade.level + 1}
            currentFinishesAt={activeUpgrade.finishesAt}
          />
        </>
      )}

      <div
        ref={setDropRef}
        className={`min-h-10 transition-colors ${isOver && queue.length === 0 ? "bg-accent/8" : ""}`}
      >
        {queue.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-3 py-6 text-center">
            <p className="text-[11px] text-white/80">No upgrades queued</p>
            <button
              onClick={() => onAddClick(slot.id)}
              className="rounded-lg border border-accent/80 bg-accent/10 px-4 py-1.5 text-[11px] font-bold text-accent hover:bg-accent/20 cursor-pointer"
            >
              + Add Upgrade
            </button>
          </div>
        ) : (
          <SortableContext items={queue.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className={`transition-colors ${isOver ? "bg-accent/5" : ""}`}>
              {queue.map((item, idx) => (
                <QueueItem
                  key={item.id}
                  item={item}
                  isConflict={conflictIds.has(item.id)}
                  conflictMessage={conflictMap.get(item.id)}
                  multiInstanceBuildingIds={multiInstanceBuildingIds}
                  onRemove={() => removeItem(item.id)}
                  onStart={!activeUpgrade && idx === 0 && onStartFirst ? () => onStartFirst(item) : undefined}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>

      {queue.length > 0 && (
        <div className="flex flex-wrap gap-3 px-3 py-2 border-t border-secondary/80 bg-primary">
          <div className="flex flex-col">
            <span className="text-[13px] font-extrabold text-accent">{totalDuration}</span>
            <span className="text-[9px] font-bold uppercase tracking-wide text-white/80">Total Time</span>
          </div>
          {Object.entries(resourceTotals).map(([resource, amount]) => (
            <ResourceFooterTotal key={resource} resource={resource} amount={amount} />
          ))}
        </div>
      )}
    </div>
  );
}
