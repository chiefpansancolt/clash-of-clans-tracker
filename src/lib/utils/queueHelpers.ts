import { isActiveUpgrade } from "@/lib/utils/upgradeHelpers";
import type { HomeVillageData } from "@/types/app/game";
import type { BuilderSlot } from "@/types/app/upgrade";
import type {
  BuilderQueueItem,
  ResearchQueueItem,
  PetQueueItem,
  QueueConflict,
  ResourceEvent,
  ResourceGroup,
} from "@/types/app/queue";

interface AnnotatedBuilderItem {
  item: BuilderQueueItem;
  scheduledStartAt: Date;
}

/**
 * Detects ordering conflicts in builder queues.
 * A conflict occurs when a higher targetLevel for a building instance is
 * scheduled to start before a lower targetLevel for the same instance.
 */
export const getBuilderQueueConflicts = (
  hv: HomeVillageData,
  slots: BuilderSlot[]
): QueueConflict[]  => {
  const allAnnotated: AnnotatedBuilderItem[] = [];

  // Build a map of builderId → active upgrade finishesAt
  const activeFinishMap = new Map<number, Date>();

  const scanRecord = (record: Record<string, Array<{ upgrade?: { finishesAt: string; builderId: number } }>>) => {
    for (const instances of Object.values(record)) {
      for (const inst of instances) {
        if (inst.upgrade && isActiveUpgrade(inst.upgrade.finishesAt)) {
          const existing = activeFinishMap.get(inst.upgrade.builderId);
          const candidate = new Date(inst.upgrade.finishesAt);
          if (!existing || candidate > existing) {
            activeFinishMap.set(inst.upgrade.builderId, candidate);
          }
        }
      }
    }
  };

  scanRecord(hv.defenses as any);
  scanRecord(hv.armyBuildings as any);
  scanRecord(hv.resourceBuildings as any);
  scanRecord(hv.traps as any);

  for (const hero of hv.heroes) {
    if (hero.upgrade && isActiveUpgrade(hero.upgrade.finishesAt)) {
      activeFinishMap.set(hero.upgrade.builderId, new Date(hero.upgrade.finishesAt));
    }
  }

  for (const slot of slots) {
    const queued = hv.builderQueues?.[String(slot.id)] ?? [];
    let cursor = activeFinishMap.get(slot.id) ?? new Date();

    for (const item of queued) {
      allAnnotated.push({ item, scheduledStartAt: new Date(cursor) });
      cursor = new Date(cursor.getTime() + item.durationMs);
    }
  }

  // Group by buildingId + instanceIndex
  const groups = new Map<string, AnnotatedBuilderItem[]>();
  for (const a of allAnnotated) {
    const key = `${a.item.buildingId}:${a.item.instanceIndex}`;
    const group = groups.get(key) ?? [];
    group.push(a);
    groups.set(key, group);
  }

  const conflicts: QueueConflict[] = [];

  for (const group of groups.values()) {
    if (group.length < 2) continue;
    // Sort by targetLevel ascending to find the expected order
    const sorted = [...group].sort((a, b) => a.item.targetLevel - b.item.targetLevel);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      // The lower level must START before the higher level starts
      if (prev.scheduledStartAt >= curr.scheduledStartAt) {
        conflicts.push({
          queueItemId: curr.item.id,
          message: `${curr.item.name} #${curr.item.instanceIndex + 1} lvl ${curr.item.targetLevel - 1}→${curr.item.targetLevel - 1 + 1} scheduled before lvl ${prev.item.targetLevel - 1}→${prev.item.targetLevel} finishes`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Detects ordering conflicts in research queues.
 * Ensures the same research item doesn't appear out of level order.
 */
export const getResearchQueueConflicts = (
  hv: HomeVillageData,
  slots: BuilderSlot[]
): QueueConflict[]  => {
  const allAnnotated: Array<{ item: ResearchQueueItem; scheduledStartAt: Date }> = [];

  const activeFinishMap = new Map<number, Date>();
  for (const item of [...hv.troops, ...hv.spells, ...hv.siegeMachines]) {
    const u = (item as any).upgrade;
    if (u && isActiveUpgrade(u.finishesAt)) {
      activeFinishMap.set(u.builderId, new Date(u.finishesAt));
    }
  }

  for (const slot of slots) {
    const queued = hv.researchQueue?.[String(slot.id)] ?? [];
    let cursor = activeFinishMap.get(slot.id) ?? new Date();
    for (const item of queued) {
      allAnnotated.push({ item, scheduledStartAt: new Date(cursor) });
      cursor = new Date(cursor.getTime() + item.durationMs);
    }
  }

  const groups = new Map<string, Array<{ item: ResearchQueueItem; scheduledStartAt: Date }>>();
  for (const a of allAnnotated) {
    const key = a.item.name.toLowerCase();
    const group = groups.get(key) ?? [];
    group.push(a);
    groups.set(key, group);
  }

  const conflicts: QueueConflict[] = [];
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const sorted = [...group].sort((a, b) => a.item.targetLevel - b.item.targetLevel);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (prev.scheduledStartAt >= curr.scheduledStartAt) {
        conflicts.push({
          queueItemId: curr.item.id,
          message: `${curr.item.name} lvl ${curr.item.targetLevel - 1}→${curr.item.targetLevel} is scheduled before lvl ${prev.item.targetLevel - 1}→${prev.item.targetLevel} finishes`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Detects ordering conflicts in the pet queue.
 * Same rule: lower level must complete before higher level starts.
 */
export const getPetQueueConflicts = (hv: HomeVillageData): QueueConflict[]  => {
  const queued = hv.petQueue ?? [];
  if (queued.length < 2) return [];

  let cursor = new Date();
  for (const pet of hv.pets) {
    const u = (pet as any).upgrade;
    if (u && isActiveUpgrade(u.finishesAt)) {
      cursor = new Date(u.finishesAt);
      break;
    }
  }

  const annotated = queued.map((item) => {
    const start = new Date(cursor);
    cursor = new Date(cursor.getTime() + item.durationMs);
    return { item, scheduledStartAt: start };
  });

  const groups = new Map<string, Array<{ item: PetQueueItem; scheduledStartAt: Date }>>();
  for (const a of annotated) {
    const key = a.item.name.toLowerCase();
    const group = groups.get(key) ?? [];
    group.push(a);
    groups.set(key, group);
  }

  const conflicts: QueueConflict[] = [];
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const sorted = [...group].sort((a, b) => a.item.targetLevel - b.item.targetLevel);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (prev.scheduledStartAt >= curr.scheduledStartAt) {
        conflicts.push({
          queueItemId: curr.item.id,
          message: `${curr.item.name} lvl ${curr.item.targetLevel - 1}→${curr.item.targetLevel} is scheduled before lvl ${prev.item.targetLevel - 1}→${prev.item.targetLevel} finishes`,
        });
      }
    }
  }

  return conflicts;
}

const ONE_HOUR_MS = 3_600_000;

/**
 * Returns grouped resource events for the builder queue.
 * Events within 1 hour of each other are placed in the same ResourceGroup.
 * Groups with no next queued item (queue is empty after this one) are omitted.
 */
export const getBuilderResourceEvents = (
  hv: HomeVillageData,
  slots: BuilderSlot[]
): ResourceGroup[]  => {
  const rawEvents: ResourceEvent[] = [];

  const activeFinishMap = new Map<number, { completesAt: Date; label: string }>();

  const scanRecord = (record: Record<string, Array<{ level: number; upgrade?: { finishesAt: string; builderId: number } }>>, getName: (id: string) => string) => {
    for (const [id, instances] of Object.entries(record)) {
      instances.forEach((inst, idx) => {
        if (inst.upgrade && isActiveUpgrade(inst.upgrade.finishesAt)) {
          const instanceSuffix = instances.length > 1 ? ` #${idx + 1}` : "";
          activeFinishMap.set(inst.upgrade.builderId, {
            completesAt: new Date(inst.upgrade.finishesAt),
            label: `${getName(id)}${instanceSuffix}  ${inst.level}→${inst.level + 1}`,
          });
        }
      });
    }
  };

  // We need building names — import lazily from the building map in upgradeHelpers
  // Pass a simple fallback name fn; the actual name comes from BuilderQueueItem
  const noName = (id: string) => id;
  scanRecord(hv.defenses as any, noName);
  scanRecord(hv.armyBuildings as any, noName);
  scanRecord(hv.resourceBuildings as any, noName);
  scanRecord(hv.traps as any, noName);

  for (const hero of hv.heroes) {
    if (hero.upgrade && isActiveUpgrade(hero.upgrade.finishesAt)) {
      activeFinishMap.set(hero.upgrade.builderId, {
        completesAt: new Date(hero.upgrade.finishesAt),
        label: `${hero.name}  ${hero.level}→${hero.level + 1}`,
      });
    }
  }

  for (const slot of slots) {
    const queued = hv.builderQueues?.[String(slot.id)] ?? [];
    if (queued.length === 0) continue;

    const active = activeFinishMap.get(slot.id);
    let cursor = active?.completesAt ?? new Date();
    const completingLabel = active?.label ?? "—";

    for (let i = 0; i < queued.length; i++) {
      const current = queued[i];
      const next = queued[i + 1];

      if (i === 0) {
        // This item starts when the active upgrade finishes — emit event for starting it
        const instanceSuffix = ` #${current.instanceIndex + 1}`;
        rawEvents.push({
          builderLabel: slot.label,
          completingItem: completingLabel,
          completesAt: new Date(cursor),
          nextItem: `${current.name}${instanceSuffix}  ${current.targetLevel - 1}→${current.targetLevel}`,
          cost: current.cost,
          costResource: current.costResource,
        });
      } else {
        const prevEnd = new Date(cursor);
        rawEvents.push({
          builderLabel: slot.label,
          completingItem: queued[i - 1] ? `${queued[i - 1].name} #${queued[i - 1].instanceIndex + 1}  ${queued[i - 1].targetLevel - 1}→${queued[i - 1].targetLevel}` : completingLabel,
          completesAt: prevEnd,
          nextItem: `${current.name} #${current.instanceIndex + 1}  ${current.targetLevel - 1}→${current.targetLevel}`,
          cost: current.cost,
          costResource: current.costResource,
        });
      }

      cursor = new Date(cursor.getTime() + current.durationMs);
    }
  }

  return groupEvents(rawEvents);
}

/**
 * Returns grouped resource events for the research queue.
 */
export const getResearchResourceEvents = (
  hv: HomeVillageData,
  slots: BuilderSlot[]
): ResourceGroup[]  => {
  const rawEvents: ResourceEvent[] = [];

  const activeFinishMap = new Map<number, { completesAt: Date; label: string }>();
  for (const item of [...hv.troops, ...hv.spells, ...hv.siegeMachines]) {
    const u = (item as any).upgrade;
    if (u && isActiveUpgrade(u.finishesAt)) {
      activeFinishMap.set(u.builderId, {
        completesAt: new Date(u.finishesAt),
        label: `${item.name}  ${item.level}→${item.level + 1}`,
      });
    }
  }

  for (const slot of slots) {
    const queued = hv.researchQueue?.[String(slot.id)] ?? [];
    if (queued.length === 0) continue;

    const active = activeFinishMap.get(slot.id);
    let cursor = active?.completesAt ?? new Date();
    const completingLabel = active?.label ?? "—";

    for (let i = 0; i < queued.length; i++) {
      const current = queued[i];
      const prevLabel = i === 0
        ? completingLabel
        : `${queued[i - 1].name}  ${queued[i - 1].targetLevel - 1}→${queued[i - 1].targetLevel}`;

      rawEvents.push({
        builderLabel: slot.label,
        completingItem: prevLabel,
        completesAt: new Date(cursor),
        nextItem: `${current.name}  ${current.targetLevel - 1}→${current.targetLevel}`,
        cost: current.cost,
        costResource: current.costResource,
      });

      cursor = new Date(cursor.getTime() + current.durationMs);
    }
  }

  return groupEvents(rawEvents);
}

/**
 * Returns grouped resource events for the pet queue.
 */
export const getPetResourceEvents = (hv: HomeVillageData): ResourceGroup[]  => {
  const queued = hv.petQueue ?? [];
  if (queued.length === 0) return [];

  const rawEvents: ResourceEvent[] = [];
  let cursor = new Date();
  let activeLabel = "—";

  for (const pet of hv.pets) {
    const u = (pet as any).upgrade;
    if (u && isActiveUpgrade(u.finishesAt)) {
      cursor = new Date(u.finishesAt);
      activeLabel = `${pet.name}  ${pet.level}→${pet.level + 1}`;
      break;
    }
  }

  for (let i = 0; i < queued.length; i++) {
    const current = queued[i];
    const prevLabel = i === 0
      ? activeLabel
      : `${queued[i - 1].name}  ${queued[i - 1].targetLevel - 1}→${queued[i - 1].targetLevel}`;

    rawEvents.push({
      builderLabel: "Pet House",
      completingItem: prevLabel,
      completesAt: new Date(cursor),
      nextItem: `${current.name}  ${current.targetLevel - 1}→${current.targetLevel}`,
      cost: current.cost,
      costResource: current.costResource,
    });

    cursor = new Date(cursor.getTime() + current.durationMs);
  }

  return groupEvents(rawEvents);
}

const groupEvents = (events: ResourceEvent[]): ResourceGroup[]  => {
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => a.completesAt.getTime() - b.completesAt.getTime());
  const groups: ResourceGroup[] = [];
  const now = Date.now();

  let groupStart = sorted[0].completesAt;
  let current: ResourceEvent[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const ev = sorted[i];
    if (ev.completesAt.getTime() - groupStart.getTime() <= ONE_HOUR_MS) {
      current.push(ev);
    } else {
      groups.push(makeGroup(current, groupStart, now));
      groupStart = ev.completesAt;
      current = [ev];
    }
  }
  groups.push(makeGroup(current, groupStart, now));

  return groups;
}

const makeGroup = (events: ResourceEvent[], date: Date, nowMs: number): ResourceGroup  => {
  const dayOffset = Math.round((date.getTime() - nowMs) / 86400_000);
  return { dayOffset: Math.max(0, dayOffset), date, events };
}
