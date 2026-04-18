"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { UpgradeStep } from "@/types/app/upgrade";
import type { InstanceData, UpgradeRowProps } from "@/types/components/upgrade";
import { formatBuildTime, formatTimeRemaining } from "@/lib/utils/upgradeHelpers";
import { FiEdit2 } from "react-icons/fi";
import { BuilderPickerModal } from "./BuilderPickerModal";
import { FinishEarlyModal } from "./FinishEarlyModal";
import { AdjustTimeModal } from "./AdjustTimeModal";

const RESOURCE_ICONS: Record<string, string> = {
  Gold: "/images/other/gold.png",
  Elixir: "/images/other/elixir.png",
  "Dark Elixir": "/images/other/dark-elixir.png",
  "Builder Gold": "/images/other/gold-b.png",
  "Builder Elixir": "/images/other/elixir-b.png",
  Gems: "/images/other/gem.png",
};

function ResourceCost({ resource, cost }: { resource: string; cost: number }) {
  const icon = RESOURCE_ICONS[resource];
  return (
    <span className="flex items-center gap-1">
      {icon && (
        <span className="relative inline-block h-3.5 w-3.5 shrink-0">
          <Image src={icon} alt={resource} fill className="object-contain" sizes="14px" />
        </span>
      )}
      <span className="text-xs font-medium text-white/90">{cost.toLocaleString()}</span>
    </span>
  );
}

export function UpgradeRow({
  name,
  imageUrl,
  instances,
  getAllSteps,
  slots,
  noQueue,
  onStartUpgrade,
  onFinishUpgrade,
  onCancelUpgrade,
  onAdjustUpgrade,
}: UpgradeRowProps) {
  const [pendingUpgrade, setPendingUpgrade] = useState<{
    instanceIndex: number;
    step: UpgradeStep;
  } | null>(null);
  const [pendingFinishEarly, setPendingFinishEarly] = useState<{
    instanceIndex: number;
    nextLevel: number;
    timeRemaining: string;
  } | null>(null);
  const [pendingAdjust, setPendingAdjust] = useState<{
    instanceIndex: number;
    nextLevel: number;
    finishesAt: string;
  } | null>(null);

  const [now, setNow] = useState(() => Date.now());
  const autoFinishedRef = useRef(new Set<string>());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    instances.forEach((inst, idx) => {
      if (!inst.upgradeState) return;
      const { finishesAt } = inst.upgradeState;
      if (new Date(finishesAt).getTime() > now) return;
      const key = `${idx}:${finishesAt}`;
      if (autoFinishedRef.current.has(key)) return;
      autoFinishedRef.current.add(key);
      onFinishUpgrade(idx);
    });
  }, [now, instances, onFinishUpgrade]);

  const hasAvailableSlot = noQueue || slots.some((s) => !s.busy);
  const visibleInstances = instances.filter(
    (inst, idx) => inst.currentLevel > 0 || inst.upgradeState || getAllSteps(inst.currentLevel, idx).length > 0
  );

  if (visibleInstances.length === 0) return null;

  return (
    <>
      {pendingAdjust && (
        <AdjustTimeModal
          isOpen
          onClose={() => setPendingAdjust(null)}
          onConfirm={(finishesAt) => {
            onAdjustUpgrade(pendingAdjust.instanceIndex, finishesAt);
            setPendingAdjust(null);
          }}
          itemName={name}
          nextLevel={pendingAdjust.nextLevel}
          currentFinishesAt={pendingAdjust.finishesAt}
        />
      )}

      {pendingFinishEarly && (
        <FinishEarlyModal
          isOpen
          onClose={() => setPendingFinishEarly(null)}
          onConfirm={() => {
            onFinishUpgrade(pendingFinishEarly.instanceIndex);
            setPendingFinishEarly(null);
          }}
          itemName={name}
          nextLevel={pendingFinishEarly.nextLevel}
          timeRemaining={pendingFinishEarly.timeRemaining}
        />
      )}

      {pendingUpgrade && (
        <BuilderPickerModal
          isOpen
          onClose={() => setPendingUpgrade(null)}
          onConfirm={(builderId) => {
            onStartUpgrade(pendingUpgrade.instanceIndex, pendingUpgrade.step, builderId);
            setPendingUpgrade(null);
          }}
          slots={slots}
          itemName={name}
          nextLevel={pendingUpgrade.step.level}
          step={pendingUpgrade.step}
        />
      )}

      <div className="overflow-hidden rounded-lg border border-secondary/80 bg-primary">
        <div className="border-b border-secondary/80 px-3 py-2">
          <span className="text-sm font-bold text-white">{name}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "112px 1px 1fr" }}>
          <div className="flex items-center justify-center p-2">
            {imageUrl ? (
              <div className="relative h-20 w-20">
                <Image src={imageUrl} alt={name} fill className="object-contain" sizes="80px" />
              </div>
            ) : (
              <div className="h-20 w-20 rounded bg-secondary/20" />
            )}
          </div>

          <div className="bg-secondary/80" />

          <div className="min-w-0">
            {visibleInstances.map((inst: InstanceData, rawIdx: number) => {
              const instanceIndex = instances.indexOf(inst);
              const allSteps = getAllSteps(inst.currentLevel, instanceIndex);
              const upgrading = inst.upgradeState && new Date(inst.upgradeState.finishesAt).getTime() > now;
              const readyToCollect = inst.upgradeState && new Date(inst.upgradeState.finishesAt).getTime() <= now;
              const atMax = allSteps.length === 0 && !inst.upgradeState;

              const isBuild = inst.currentLevel === 0;

              return (
                <div key={rawIdx} className={rawIdx > 0 ? "border-t border-secondary/80" : ""}>
                  <div className="px-3 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
                    #{rawIdx + 1} · {isBuild ? "Not Built" : `Lvl ${inst.currentLevel}`}
                  </div>

                  {upgrading && (
                    <div className="flex flex-wrap items-center gap-2 px-3 py-1.5">
                      <span className="text-xs text-amber-400">
                        → {inst.currentLevel + 1} {isBuild ? "building" : "upgrading"} · {formatTimeRemaining(inst.upgradeState!.finishesAt)}
                      </span>
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setPendingAdjust({
                              instanceIndex,
                              nextLevel: inst.currentLevel + 1,
                              finishesAt: inst.upgradeState!.finishesAt,
                            })
                          }
                          className="cursor-pointer rounded p-1 text-white/80 hover:bg-white/10"
                          title="Adjust time"
                        >
                          <FiEdit2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingFinishEarly({
                              instanceIndex,
                              nextLevel: inst.currentLevel + 1,
                              timeRemaining: formatTimeRemaining(inst.upgradeState!.finishesAt),
                            })
                          }
                          className="cursor-pointer rounded px-2 py-0.5 text-[11px] text-green-400 hover:bg-white/10"
                        >
                          Finish
                        </button>
                        <button
                          type="button"
                          onClick={() => onCancelUpgrade(instanceIndex)}
                          className="cursor-pointer rounded px-2 py-0.5 text-[11px] text-white/80 hover:bg-white/10"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {readyToCollect && (
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      <span className="text-xs text-green-400">Ready!</span>
                      <button
                        type="button"
                        onClick={() => onFinishUpgrade(instanceIndex)}
                        className="ml-auto cursor-pointer rounded-md bg-green-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-green-500"
                      >
                        Collect
                      </button>
                    </div>
                  )}

                  {!inst.upgradeState && allSteps.length > 0 && (
                    <div>
                      {allSteps.map((step, si) => (
                        <div key={step.level} className="flex items-center gap-2 px-3 py-1.5">
                          <span className="w-8 shrink-0 text-[11px] text-white/80">
                            → {step.level}
                          </span>
                          <ResourceCost resource={step.costResource} cost={step.cost} />
                          <span className="text-[11px] text-white/80">
                            {formatBuildTime(step.buildTime)}
                          </span>
                          {si === 0 && (
                            noQueue ? (
                              <button
                                type="button"
                                onClick={() => onFinishUpgrade(instanceIndex)}
                                className="ml-auto cursor-pointer rounded-md bg-accent px-2.5 py-0.5 text-[11px] font-bold text-primary hover:bg-accent/80"
                              >
                                {isBuild ? "Build" : "Upgrade"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={!hasAvailableSlot}
                                onClick={() => setPendingUpgrade({ instanceIndex, step })}
                                title={hasAvailableSlot ? undefined : "All builders are busy"}
                                className={`ml-auto rounded-md px-2.5 py-0.5 text-[11px] font-bold transition-colors ${
                                  hasAvailableSlot
                                    ? "bg-accent text-primary hover:bg-accent/80 cursor-pointer"
                                    : "cursor-not-allowed bg-secondary/20 text-white/80"
                                }`}
                              >
                                {isBuild ? "Build" : "Upgrade"}
                              </button>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {atMax && (
                    <div className="px-3 py-1.5">
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-bold text-accent">
                        Max Level {inst.currentLevel}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
