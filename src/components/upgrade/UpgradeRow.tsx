"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { UpgradeStep } from "@/types/app/upgrade";
import type { InstanceData, UpgradeRowProps } from "@/types/components/upgrade";
import { formatBuildTime, formatTimeRemaining, applyBoost, applyBuilderBoostCost, msToBuildTime, getGemCost } from "@/lib/utils/upgradeHelpers";
import { FiEdit2 } from "react-icons/fi";
import { RiArrowRightLine } from "react-icons/ri";
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

const ResourceCost = ({ resource, cost, boosted }: { resource: string; cost: number; boosted?: boolean }) => {
  const icon = RESOURCE_ICONS[resource];
  return (
    <span className="flex items-center gap-1">
      {icon && (
        <span className="relative inline-block h-3.5 w-3.5 shrink-0">
          <Image src={icon} alt={resource} fill className="object-contain" sizes="14px" />
        </span>
      )}
      <span className={`text-xs font-medium ${boosted ? "text-amber-400" : "text-white/90"}`}>{cost.toLocaleString()}</span>
    </span>
  );
}

export const UpgradeRow = ({
  name,
  imageUrl,
  instances,
  getAllSteps,
  slots,
  noQueue,
  hideIfComplete = false,
  boostPct = 0,
  onStartUpgrade,
  onFinishUpgrade,
  onCancelUpgrade,
  onAdjustUpgrade,
}: UpgradeRowProps) => {
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
  if (hideIfComplete && instances.every((inst, idx) => !inst.upgradeState && getAllSteps(inst.currentLevel, idx).length === 0)) return null;

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

          <div className={`min-w-0 ${visibleInstances.length > 1 ? "grid grid-cols-2" : ""}`}>
            {visibleInstances.map((inst: InstanceData, rawIdx: number) => {
              const instanceIndex = instances.indexOf(inst);
              const allSteps = getAllSteps(inst.currentLevel, instanceIndex);
              const upgrading = inst.upgradeState && new Date(inst.upgradeState.finishesAt).getTime() > now;
              const readyToCollect = inst.upgradeState && new Date(inst.upgradeState.finishesAt).getTime() <= now;
              const atMax = allSteps.length === 0 && !inst.upgradeState;

              const isBuild = inst.currentLevel === 0;
              const multiCol = visibleInstances.length > 1;
              const borderClass = multiCol
                ? [rawIdx % 2 === 1 ? "border-l border-secondary/80" : "", rawIdx >= 2 ? "border-t border-secondary/80" : ""].filter(Boolean).join(" ")
                : rawIdx > 0 ? "border-t border-secondary/80" : "";

              return (
                <div key={rawIdx} className={borderClass}>
                  <div className="px-3 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
                    #{rawIdx + 1} · {isBuild ? "Not Built" : `Lvl ${inst.currentLevel}`}
                  </div>

                  {upgrading && (
                    <div className="flex flex-wrap items-center gap-2 px-3 py-1.5">
                      <span className="text-xs text-amber-400">
                        <RiArrowRightLine size={12} className="shrink-0" /> {inst.currentLevel + 1} {isBuild ? "building" : "upgrading"} · {formatTimeRemaining(inst.upgradeState!.finishesAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="relative inline-block h-3.5 w-3.5 shrink-0">
                          <Image src="/images/other/gem.png" alt="Gems" fill className="object-contain" sizes="14px" />
                        </span>
                        <span className="text-[11px] text-cyan-300">
                          {getGemCost(Math.max(0, new Date(inst.upgradeState!.finishesAt).getTime() - now)).toLocaleString()}
                        </span>
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

                  {(() => {
                    const stepsToShow = inst.upgradeState ? allSteps.slice(1) : allSteps;
                    if (stepsToShow.length === 0) return null;
                    const isBoosted = boostPct > 0;
                    return (
                      <div className="grid grid-cols-2 gap-1.5 p-2">
                        {stepsToShow.map((step, si) => {
                          const boostedDurationMs = applyBoost(step.durationMs, boostPct);
                          const boostedCost = applyBuilderBoostCost(step.cost, boostPct);
                          const boostedTime = formatBuildTime(msToBuildTime(boostedDurationMs));
                          const isFirst = si === 0 && !inst.upgradeState;
                          return (
                            <div key={`${step.isSupercharge ? "sc" : ""}${step.level}`} className={`flex flex-col gap-1 rounded-md border p-2 ${step.isSupercharge ? "border-cyan-400/80 bg-cyan-400/5" : "border-white/80 bg-white/5"}`}>
                              <div className="flex items-center justify-between gap-1">
                                <span className={`flex items-center gap-1 text-[10px] font-bold ${step.isSupercharge ? "text-cyan-300" : "text-white/80"}`}>
                                  {step.isSupercharge ? (
                                    <span className="relative inline-block h-3.5 w-3.5 shrink-0">
                                      <Image src="/images/other/supercharge.png" alt="Supercharge" fill className="object-contain" sizes="14px" />
                                    </span>
                                  ) : <RiArrowRightLine size={10} />} Lv {step.level}
                                </span>
                                <span className={`text-[10px] ${isBoosted ? "text-amber-400" : "text-white/80"}`}>{boostedTime}</span>
                              </div>
                              <ResourceCost resource={step.costResource} cost={boostedCost} boosted={isBoosted} />
                              {isFirst && (
                                noQueue ? (
                                  <button
                                    type="button"
                                    onClick={() => onFinishUpgrade(instanceIndex)}
                                    className="mt-0.5 cursor-pointer rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold text-primary hover:bg-accent/80"
                                  >
                                    {isBuild ? "Build" : "Upgrade"}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={!hasAvailableSlot}
                                    onClick={() => setPendingUpgrade({ instanceIndex, step })}
                                    title={hasAvailableSlot ? undefined : "All builders are busy"}
                                    className={`mt-0.5 rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors ${
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
                          );
                        })}
                      </div>
                    );
                  })()}

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

        {(() => {
          const costTotals: Record<string, number> = {};
          let totalMs = 0;
          let totalLevels = 0;
          let instancesWithUpgrades = 0;
          instances.forEach((inst, idx) => {
            const allSteps = getAllSteps(inst.currentLevel, idx);
            // Skip the step currently in progress (active or ready-to-collect)
            const pendingSteps = inst.upgradeState ? allSteps.slice(1) : allSteps;
            if (allSteps.length > 0) instancesWithUpgrades++;
            totalLevels += pendingSteps.length;
            pendingSteps.forEach((step) => {
              costTotals[step.costResource] = (costTotals[step.costResource] ?? 0) + applyBuilderBoostCost(step.cost, boostPct);
              totalMs += applyBoost(step.durationMs, boostPct);
            });
          });
          const resources = Object.entries(costTotals).filter(([, v]) => v > 0);
          if (instancesWithUpgrades === 0 || totalLevels === 0) return null;
          const isBoosted = boostPct > 0;
          const footerItems: React.ReactNode[] = [];
          if (instancesWithUpgrades > 1) footerItems.push(<span key="instances" className="text-[11px] text-white/80">{instancesWithUpgrades} instances</span>);
          if (totalLevels > 0) footerItems.push(<span key="levels" className="text-[11px] text-white/80">{totalLevels} levels</span>);
          resources.forEach(([resource, total]) => footerItems.push(<ResourceCost key={resource} resource={resource} cost={total} boosted={isBoosted} />));
          if (totalMs > 0) footerItems.push(<span key="time" className={`text-[11px] ${isBoosted ? "text-amber-400" : "text-white/80"}`}>{formatBuildTime(msToBuildTime(totalMs))}</span>);
          return (
            <div className="flex flex-wrap items-center gap-y-1 border-t border-secondary/80 px-3 py-2">
              {footerItems.map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="mx-2 text-white/80">·</span>}
                  {item}
                </React.Fragment>
              ))}
            </div>
          );
        })()}
      </div>
    </>
  );
}
