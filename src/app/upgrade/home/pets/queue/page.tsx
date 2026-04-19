"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RiArrowLeftLine } from "react-icons/ri";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import {
  getPetSlots,
  getPetTimeline,
  isActiveUpgrade,
} from "@/lib/utils/upgradeHelpers";
import {
  getPetQueueConflicts,
  getPetResourceEvents,
} from "@/lib/utils/queueHelpers";
import { QueueTimeline } from "@/components/upgrade/queue/QueueTimeline";
import { PetQueueCard } from "@/components/upgrade/queue/PetQueueCard";
import { AvailablePetUpgradesPanel } from "@/components/upgrade/queue/AvailableUpgradesPanel";
import { ResourcePlannerModal } from "@/components/upgrade/queue/ResourcePlannerModal";
import type { PetQueueItem } from "@/types/app/queue";

export default function PetsQueuePage() {
  const router = useRouter();
  const { activePlaythrough, isLoaded, updatePlaythrough } = usePlaythrough();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const [panelOpen, setPanelOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);

  const hv = activePlaythrough?.data.homeVillage;
  const thLevel = hv?.townHallLevel ?? 1;
  const slots = hv ? getPetSlots(hv) : [];

  const petTimelineBlocks = useMemo(() => (hv ? getPetTimeline(hv) : []), [hv]);
  const timeline = useMemo<Record<string, import("@/types/app/queue").TimelineBlock[]>>(
    () => ({ "1": petTimelineBlocks }),
    [petTimelineBlocks]
  );

  const conflicts = useMemo(() => (hv ? getPetQueueConflicts(hv) : []), [hv]);
  const conflictItemIds = useMemo(() => new Set(conflicts.map((c) => c.queueItemId)), [conflicts]);

  const resourceGroups = useMemo(() => (hv ? getPetResourceEvents(hv) : []), [hv]);

  const activeUpgrade = useMemo(() => {
    if (!hv) return undefined;
    for (const pet of hv.pets) {
      const u = (pet as any).upgrade;
      if (u && isActiveUpgrade(u.finishesAt)) {
        return {
          label: `${pet.name} ${pet.level}→${pet.level + 1}`,
          finishesAt: u.finishesAt,
        };
      }
    }
    return undefined;
  }, [hv]);

  function handleQueueChange(newQueue: PetQueueItem[]) {
    if (!activePlaythrough || !hv) return;
    updatePlaythrough(activePlaythrough.id, {
      data: {
        ...activePlaythrough.data,
        homeVillage: { ...hv, petQueue: newQueue },
      },
    });
  }

  function handleAddItem(item: PetQueueItem) {
    const existing = hv?.petQueue ?? [];
    handleQueueChange([...existing, item]);
  }

  if (!activePlaythrough || !hv) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/upgrade/home/pets"
            className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            <RiArrowLeftLine size={16} />
            Pets
          </Link>
          <span className="text-gray-400">/</span>
          <h1 className="text-[18px] font-extrabold text-gray-900">Queue</h1>
          <span className="text-sm text-gray-500">TH{thLevel}</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setPlannerOpen(true)}
              className="cursor-pointer rounded-lg border border-primary/80 bg-primary/10 px-3 py-1.5 text-[12px] font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              📊 Resource Planner
            </button>
            <button
              onClick={() => setPanelOpen(true)}
              className="cursor-pointer rounded-lg bg-accent px-3 py-1.5 text-[12px] font-bold text-primary hover:bg-accent/90 transition-colors"
            >
              + Add Pet
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {slots.length > 0 && (
          <QueueTimeline
            timeline={timeline}
            slots={slots}
            conflictItemIds={conflictItemIds}
          />
        )}

        <div className="flex-1 p-4">
          {thLevel < 14 ? (
            <p className="py-8 text-center text-sm text-white/80">Pets unlock at TH14.</p>
          ) : (
            <PetQueueCard
              queue={hv.petQueue ?? []}
              activeUpgrade={activeUpgrade}
              isBusy={!!activeUpgrade}
              conflicts={conflicts}
              onQueueChange={handleQueueChange}
              onAddClick={() => setPanelOpen(true)}
            />
          )}
        </div>
      </div>

      {panelOpen && (
        <AvailablePetUpgradesPanel
          hv={hv}
          onAdd={handleAddItem}
          onClose={() => setPanelOpen(false)}
        />
      )}

      {plannerOpen && (
        <ResourcePlannerModal
          groups={resourceGroups}
          title="Pet Upgrade Planner"
          onClose={() => setPlannerOpen(false)}
        />
      )}
    </div>
  );
}
