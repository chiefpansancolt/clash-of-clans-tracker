"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import {
  getForgeDurationMs,
  formatForgeDuration,
  RESOURCE_META,
  RESOURCE_ORDER,
  type ConversionRate,
} from "@/lib/utils/forgeHelpers";
import type { AutoForgeData, ForgeResourceType } from "@/types/app/playthrough";
import type { ForgeSlotRowProps } from "@/types/components/forge";

export function ForgeSlotRow({
  label,
  slot,
  isAuto = false,
  locked = false,
  unlocksTH,
  rates,
  builderBoostPct,
  thLevel,
  bhLevel,
  onStart,
  onStop,
}: ForgeSlotRowProps) {
  const isRunning = !!slot.endsAt;
  const [display, setDisplay] = useState(() =>
    slot.endsAt ? Math.max(0, new Date(slot.endsAt).getTime() - Date.now()) : 0
  );
  const isDone = isRunning && display === 0;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!slot.endsAt) { return; }
    const remaining = Math.max(0, new Date(slot.endsAt).getTime() - Date.now());
    if (remaining <= 0) return;
    intervalRef.current = setInterval(() => {
      const r = Math.max(0, new Date(slot.endsAt!).getTime() - Date.now());
      setDisplay(r);
      if (r <= 0 && intervalRef.current) clearInterval(intervalRef.current);
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [slot.endsAt]);

  const durationMs = slot.durationMs || getForgeDurationMs(builderBoostPct);
  const progress = durationMs > 0 ? Math.min(100, ((durationMs - display) / durationMs) * 100) : 0;

  const [selectedResource, setSelectedResource] = useState<ForgeResourceType>(
    (slot.resourceType as ForgeResourceType | null) ?? "gold"
  );

  function isResourceAvailable(rt: ForgeResourceType): boolean {
    if (rt === "darkElixir") return thLevel >= 13;
    if (rt === "builderGold" || rt === "builderElixir") return bhLevel >= 8;
    return true;
  }

  function getRate(rt: ForgeResourceType): ConversionRate | undefined {
    return rates.find((r) => r.resourceType === rt);
  }

  const selectedRate = getRate(selectedResource);

  if (locked) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 opacity-40">
        <span className="w-16 shrink-0 text-xs font-bold text-white/80">{label}</span>
        <div className="flex gap-1.5">
          {RESOURCE_ORDER.map((rt) => (
            <div key={rt} className="relative h-6 w-6 shrink-0 grayscale opacity-50">
              <Image src={toPublicImageUrl(RESOURCE_META[rt].image)} alt={rt} fill sizes="24px" className="object-contain" />
            </div>
          ))}
        </div>
        <span className="ml-auto text-[11px] text-white/80">
          {unlocksTH ? `Unlocks at TH${unlocksTH}` : "Locked"}
        </span>
      </div>
    );
  }

  const activeResource = (slot.resourceType as ForgeResourceType | null) ?? "gold";

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className={`w-16 shrink-0 text-xs font-bold ${isAuto ? "text-accent" : "text-white/80"}`}>
        {label}
      </span>

      {isRunning ? (
        <div className="flex w-36 shrink-0 items-center gap-1.5">
          <div className="relative h-6 w-6 shrink-0">
            <Image
              src={toPublicImageUrl(RESOURCE_META[activeResource].image)}
              alt={RESOURCE_META[activeResource].label}
              fill
              sizes="24px"
              className="object-contain"
            />
          </div>
          <span className="text-[11px] text-white/80">{RESOURCE_META[activeResource].shortLabel}</span>
          {"resourceAmount" in slot && (slot as AutoForgeData).resourceAmount > 0 && (
            <span className="text-[10px] text-white/80">
              {(slot as AutoForgeData).resourceAmount.toLocaleString()}
            </span>
          )}
        </div>
      ) : (
        <div className="flex w-36 shrink-0 flex-wrap gap-1">
          {RESOURCE_ORDER.map((rt) => {
            const avail = isResourceAvailable(rt);
            return (
              <button
                key={rt}
                type="button"
                disabled={!avail}
                onClick={() => setSelectedResource(rt)}
                title={RESOURCE_META[rt].label}
                className={`cursor-pointer relative h-6 w-6 rounded transition-opacity disabled:cursor-not-allowed disabled:opacity-30 ${
                  selectedResource === rt ? "opacity-100 ring-1 ring-accent" : "opacity-50 hover:opacity-80"
                }`}
              >
                <Image src={toPublicImageUrl(RESOURCE_META[rt].image)} alt={rt} fill sizes="24px" className="object-contain" />
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-1 min-w-0">
        {isRunning ? (
          <div className="flex flex-col gap-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className={`text-xs font-extrabold tabular-nums ${isDone ? "text-green-400" : "text-white"}`}>
              {isDone ? "Done!" : formatForgeDuration(display)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/80">Idle</span>
            {selectedRate?.available && (
              <span className="text-[10px] text-white/80">
                {selectedRate.cost > 0 ? `${(selectedRate.cost / 1000000).toFixed(1)}M → ` : ""}
                {selectedRate.capitalGold > 0 ? `${selectedRate.capitalGold.toLocaleString()} CG` : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {isRunning && slot.capitalGoldOutput > 0 ? (
        <div className="flex shrink-0 items-center gap-1 w-20 justify-end">
          <div className="relative h-4 w-4 shrink-0">
            <Image src={toPublicImageUrl("images/other/gold-c.png")} alt="Capital Gold" fill sizes="16px" className="object-contain" />
          </div>
          <span className="text-xs font-extrabold text-accent">{slot.capitalGoldOutput.toLocaleString()}</span>
        </div>
      ) : !isRunning && selectedRate?.capitalGold ? (
        <div className="flex shrink-0 items-center gap-1 w-20 justify-end">
          <div className="relative h-4 w-4 shrink-0">
            <Image src={toPublicImageUrl("images/other/gold-c.png")} alt="Capital Gold" fill sizes="16px" className="object-contain" />
          </div>
          <span className="text-xs font-bold text-accent/80">{selectedRate.capitalGold.toLocaleString()}</span>
        </div>
      ) : (
        <div className="w-20 shrink-0" />
      )}

      <div className="shrink-0">
        {isRunning ? (
          <button
            type="button"
            onClick={onStop}
            className="cursor-pointer rounded bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/20"
          >
            {isDone ? "Reset" : "Stop"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              const rate = getRate(selectedResource);
              if (!rate) return;
              onStart(selectedResource, rate);
            }}
            disabled={!selectedRate?.available}
            className="cursor-pointer rounded bg-accent px-3 py-1.5 text-xs font-bold text-primary hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start
          </button>
        )}
      </div>
    </div>
  );
}
