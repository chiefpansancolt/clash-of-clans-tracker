"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { HiCheck, HiX } from "react-icons/hi";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { getDailyForgeAmount } from "@/lib/utils/forgeHelpers";
import {
  isAvailable,
  msUntilNextReset,
  formatCountdown,
} from "@/lib/utils/dailyTimerHelpers";
import type { CapitalGoldCardProps } from "@/types/components/forge";

export function CapitalGoldCard({ timer, thLevel, onCollect, onAdjust }: CapitalGoldCardProps) {
  const available = isAvailable(timer);
  const counting = !available && !!timer.resetTime;

  const [msLeft, setMsLeft] = useState<number>(() =>
    counting ? msUntilNextReset(timer.resetTime!) : 0
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!counting || !timer.resetTime) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      const remaining = msUntilNextReset(timer.resetTime!);
      setMsLeft(remaining);
      if (remaining <= 0 && intervalRef.current) clearInterval(intervalRef.current);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [counting, timer.resetTime]);

  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustValue, setAdjustValue] = useState(timer.resetTime ?? "");
  const [setupTime, setSetupTime] = useState("");

  const dailyAmount = getDailyForgeAmount(thLevel);

  function handleCollect() {
    if (!timer.resetTime && setupTime) {
      onCollect(setupTime);
      setSetupTime("");
    } else {
      onCollect(timer.resetTime);
    }
  }

  function handleAdjustConfirm() {
    if (adjustValue) onAdjust(adjustValue);
    setShowAdjust(false);
  }

  return (
    <div className="rounded-xl border border-secondary/80 bg-primary p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative h-10 w-10 shrink-0">
          <Image
            src={toPublicImageUrl("images/other/gold-c.png")}
            alt="Capital Gold"
            fill
            sizes="40px"
            className="object-contain"
          />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-white">Daily Capital Gold</h3>
          {dailyAmount > 0 && (
            <p className="text-xs text-white/80">+{dailyAmount.toLocaleString()} CG available daily</p>
          )}
        </div>
        {available && timer.resetTime && (
          <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shrink-0">
            <HiCheck className="h-4 w-4 text-white" />
          </span>
        )}
      </div>

      {!timer.resetTime ? (
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={setupTime}
            onChange={(e) => setSetupTime(e.target.value)}
            className="flex-1 rounded border border-secondary/80 bg-white/10 px-2 py-1.5 text-sm text-white scheme-dark focus:outline-none focus:ring-1 focus:ring-accent/80"
          />
          <button
            type="button"
            onClick={handleCollect}
            disabled={!setupTime}
            className="cursor-pointer rounded bg-accent px-3 py-1.5 text-xs font-bold text-primary hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Collect & Set Time
          </button>
        </div>
      ) : showAdjust ? (
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={adjustValue}
            onChange={(e) => setAdjustValue(e.target.value)}
            className="flex-1 rounded border border-secondary/80 bg-white/10 px-2 py-1.5 text-sm text-white scheme-dark focus:outline-none focus:ring-1 focus:ring-accent/80"
          />
          <button
            type="button"
            onClick={handleAdjustConfirm}
            className="cursor-pointer rounded bg-accent px-3 py-1.5 text-xs font-bold text-primary hover:bg-accent/80"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setShowAdjust(false)}
            className="cursor-pointer rounded bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/20"
          >
            <HiX className="h-3 w-3" />
          </button>
        </div>
      ) : available ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCollect}
            className="cursor-pointer rounded bg-accent px-4 py-1.5 text-xs font-bold text-primary hover:bg-accent/80"
          >
            Collect
          </button>
          <span className="text-xs text-white/80">Resets at {timer.resetTime}</span>
          <button
            type="button"
            onClick={() => { setAdjustValue(timer.resetTime ?? ""); setShowAdjust(true); }}
            className="cursor-pointer ml-auto rounded bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/20"
          >
            Adjust
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-lg font-extrabold tabular-nums text-white">{formatCountdown(msLeft)}</span>
          <span className="text-xs text-white/80">until reset at {timer.resetTime}</span>
          <button
            type="button"
            onClick={() => { setAdjustValue(timer.resetTime ?? ""); setShowAdjust(true); }}
            className="cursor-pointer ml-auto rounded bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/20"
          >
            Adjust
          </button>
        </div>
      )}
    </div>
  );
}
