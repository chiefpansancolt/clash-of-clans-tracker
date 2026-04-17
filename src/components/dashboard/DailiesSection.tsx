"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { getForgeDurationMs } from "@/lib/utils/forgeHelpers";
import {
  isAvailable,
  msUntilNextReset,
  formatCountdown,
} from "@/lib/utils/dailyTimerHelpers";
import type { AutoForgeData, DailiesData, DailyTimerData, ForgeResourceType, GoldPassData, HelpersData } from "@/types/app/playthrough";
import type { AutoForgeChipProps, DailiesSectionProps, GoldPassItem, TimerChipProps } from "@/types/components/dashboard";

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const emptyTimer: DailyTimerData = { resetTime: null, lastCollectedAt: null };

export const defaultDailies: DailiesData = {
  helpers: {
    prospectorUnlocked: false,
    prospector: { ...emptyTimer },
    alchemist: { ...emptyTimer },
    buildersApprentice: { ...emptyTimer },
    labAssistant: { ...emptyTimer },
  },
  starBonus: { ...emptyTimer },
  capitalGold: { ...emptyTimer },
  goldPass: {
    builderBoostPct: 0,
    researchBoostPct: 0,
    monthKey: "",
    hoggyBankUnlocked: false,
    gemDonationsUnlocked: false,
    autoForgeUnlocked: false,
    requestTimeReductionUnlocked: false,
  },
  autoForge: { endsAt: null, resourceType: "gold", resourceAmount: 0, capitalGoldOutput: 0, durationMs: 0 },
  forgeSlots: Array.from({ length: 4 }, () => ({
    resourceType: null,
    endsAt: null,
    durationMs: 0,
    capitalGoldOutput: 0,
    resourceCost: 0,
  })),
};



function TimerChip({ label, imageUrl, timer, onCollect, onAdjust }: TimerChipProps) {
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
    setMsLeft(msUntilNextReset(timer.resetTime));
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
    <div className="flex flex-col items-center gap-1.5 min-w-18">
      <div
        className={`relative h-10 w-10 cursor-pointer transition-opacity ${available ? "opacity-100" : "opacity-60"}`}
        onClick={() => {
          if (available && timer.resetTime) handleCollect();
        }}
        title={available ? `Click to mark ${label} as used` : undefined}
      >
        <Image src={imageUrl} alt={label} fill sizes="40px" className="object-contain" />
        {available && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-500">
            <svg viewBox="0 0 8 8" className="h-2 w-2 fill-white">
              <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      <span className="text-[9px] font-bold uppercase tracking-wide text-white/80 text-center leading-tight">
        {label}
      </span>

      {!timer.resetTime ? (
        <div className="flex flex-col items-center gap-1 w-full">
          <input
            type="time"
            value={setupTime}
            onChange={(e) => setSetupTime(e.target.value)}
            className="w-full rounded border border-secondary/80 bg-white/10 px-1 py-0.5 text-[10px] text-white scheme-dark focus:outline-none focus:ring-1 focus:ring-accent/80 text-center"
          />
          <button
            type="button"
            onClick={handleCollect}
            className="cursor-pointer w-full rounded bg-accent px-1 py-0.5 text-[10px] font-bold text-primary hover:bg-accent/80"
          >
            Use
          </button>
        </div>
      ) : showAdjust ? (
        <div className="flex flex-col items-center gap-1 w-full">
          <input
            type="time"
            value={adjustValue}
            onChange={(e) => setAdjustValue(e.target.value)}
            className="w-full rounded border border-secondary/80 bg-white/10 px-1 py-0.5 text-[10px] text-white scheme-dark focus:outline-none focus:ring-1 focus:ring-accent/80 text-center"
          />
          <div className="flex gap-1 w-full">
            <button
              type="button"
              onClick={handleAdjustConfirm}
              className="cursor-pointer flex-1 rounded bg-accent px-1 py-0.5 text-[10px] font-bold text-primary hover:bg-accent/80"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowAdjust(false)}
              className="cursor-pointer flex-1 rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/80 hover:bg-white/20"
            >
              ✕
            </button>
          </div>
        </div>
      ) : available ? (
        <div className="flex flex-col items-center gap-1 w-full">
          <button
            type="button"
            onClick={handleCollect}
            className="cursor-pointer w-full rounded bg-accent px-1 py-0.5 text-[10px] font-bold text-primary hover:bg-accent/80"
          >
            Use
          </button>
          <button
            type="button"
            onClick={() => { setAdjustValue(timer.resetTime ?? ""); setShowAdjust(true); }}
            className="cursor-pointer w-full rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/80 hover:bg-white/20"
          >
            Adjust
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 w-full">
          <span className="text-[10px] font-extrabold tabular-nums text-white/80 text-center">
            {formatCountdown(msLeft)}
          </span>
          <button
            type="button"
            onClick={() => { setAdjustValue(timer.resetTime ?? ""); setShowAdjust(true); }}
            className="cursor-pointer w-full rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/80 hover:bg-white/20"
          >
            Adjust
          </button>
        </div>
      )}
    </div>
  );
}


function LockedChip({ label, imageUrl }: { label: string; imageUrl: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-18 opacity-40">
      <div className="relative h-10 w-10">
        <Image src={imageUrl} alt={label} fill sizes="40px" className="object-contain grayscale" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 16 16" className="h-5 w-5 drop-shadow" fill="white">
            <path d="M11 7V5a3 3 0 0 0-6 0v2H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1ZM7 5a1 1 0 1 1 2 0v2H7V5Z" />
          </svg>
        </div>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wide text-white/80 text-center leading-tight">
        {label}
      </span>
      <span className="text-[9px] text-white/80">Locked</span>
    </div>
  );
}


function Divider() {
  return <div className="w-px self-stretch bg-secondary/80" />;
}


const GP_BASE = "images/season-pass/pass-items/";


function GoldPassDisplay({ goldPass }: { goldPass: GoldPassData }) {
  const col1: GoldPassItem[] = [
    { type: "pct",  label: "Builder",     image: `${GP_BASE}perk-builder-boost.png`,          value: goldPass.builderBoostPct },
    { type: "pct",  label: "Research",    image: `${GP_BASE}perk-research-boost.png`,         value: goldPass.researchBoostPct },
    { type: "bool", label: "Hoggy Bank",  image: `${GP_BASE}hoggy-bank.png`,                  unlocked: goldPass.hoggyBankUnlocked },
  ];
  const col2: GoldPassItem[] = [
    { type: "bool", label: "1 Gem Dono",  image: `${GP_BASE}perk-1-gem-donations.png`,        unlocked: goldPass.gemDonationsUnlocked },
    { type: "bool", label: "Auto Forge",  image: `${GP_BASE}perk-auto-forge.png`,             unlocked: goldPass.autoForgeUnlocked },
    { type: "bool", label: "Req. Reduce", image: `${GP_BASE}perk-request-time-reduction.png`, unlocked: goldPass.requestTimeReductionUnlocked },
  ];

  function renderItem(item: GoldPassItem, idx: number) {
    const locked = item.type === "bool" && !item.unlocked;
    return (
      <div key={idx} className={`flex items-center gap-1.5 ${locked ? "opacity-40" : ""}`}>
        <div className="relative h-6 w-6 shrink-0">
          <Image
            src={toPublicImageUrl(item.image)}
            alt={item.label}
            fill
            sizes="24px"
            className={`object-contain${locked ? " grayscale" : ""}`}
          />
        </div>
        <span className="text-[10px] text-white/80 leading-tight truncate">{item.label}</span>
        {item.type === "pct" ? (
          <span className="ml-auto text-[10px] font-extrabold text-accent shrink-0">{item.value}%</span>
        ) : item.unlocked ? (
          <svg viewBox="0 0 8 8" className="ml-auto h-3 w-3 shrink-0">
            <path d="M1 4l2 2 4-4" stroke="#f0b429" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="ml-auto h-3 w-3 shrink-0 fill-white/80">
            <path d="M11 7V5a3 3 0 0 0-6 0v2H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1ZM7 5a1 1 0 1 1 2 0v2H7V5Z" />
          </svg>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Gold Pass</span>
      <div className="flex gap-4">
        <div className="flex flex-col gap-2 w-28">{col1.map(renderItem)}</div>
        <div className="flex flex-col gap-2 w-28">{col2.map(renderItem)}</div>
      </div>
    </div>
  );
}


function formatMs(ms: number): string {
  const totalSecs = Math.ceil(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const RESOURCE_META: Record<ForgeResourceType, { label: string; image: string }> = {
  gold:          { label: "Gold",          image: "images/other/gold.png" },
  elixir:        { label: "Elixir",        image: "images/other/elixir.png" },
  darkElixir:    { label: "Dark Elixir",   image: "images/other/dark-elixir.png" },
  builderGold:   { label: "Builder Gold",  image: "images/other/gold-b.png" },
  builderElixir: { label: "Builder Elixir",image: "images/other/elixir-b.png" },
};


function AutoForgeChip({ autoForge, builderBoostPct, onStart, onStop }: AutoForgeChipProps) {
  const msLeft = autoForge.endsAt ? Math.max(0, new Date(autoForge.endsAt).getTime() - Date.now()) : 0;
  const isDone = !!autoForge.endsAt && msLeft === 0;

  const [display, setDisplay] = useState(msLeft);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!autoForge.endsAt) { setDisplay(0); return; }
    const remaining = Math.max(0, new Date(autoForge.endsAt).getTime() - Date.now());
    setDisplay(remaining);
    if (remaining <= 0) return;
    intervalRef.current = setInterval(() => {
      const r = Math.max(0, new Date(autoForge.endsAt!).getTime() - Date.now());
      setDisplay(r);
      if (r <= 0 && intervalRef.current) clearInterval(intervalRef.current);
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoForge.endsAt]);

  // Form state — pre-fill duration from effective forge time (accounts for builder boost)
  const effectiveDurationMs = getForgeDurationMs(builderBoostPct);
  const defaultH = Math.floor(effectiveDurationMs / 3600000);
  const defaultM = Math.floor((effectiveDurationMs % 3600000) / 60000);
  const [durH, setDurH] = useState(String(defaultH));
  const [durM, setDurM] = useState(String(defaultM));
  const [resourceType, setResourceType] = useState<ForgeResourceType>(autoForge.resourceType);
  const [resourceAmount, setResourceAmount] = useState(autoForge.resourceAmount > 0 ? String(autoForge.resourceAmount) : "");
  const [capitalGoldOutput, setCapitalGoldOutput] = useState(autoForge.capitalGoldOutput > 0 ? String(autoForge.capitalGoldOutput) : "");

  function handleStart() {
    const h = Math.max(0, parseInt(durH) || 0);
    const m = Math.max(0, Math.min(59, parseInt(durM) || 0));
    const durationMs = (h * 3600 + m * 60) * 1000;
    if (durationMs <= 0) return;
    onStart({
      endsAt: new Date(Date.now() + durationMs).toISOString(),
      resourceType,
      resourceAmount: parseInt(resourceAmount) || 0,
      capitalGoldOutput: parseInt(capitalGoldOutput) || 0,
      durationMs,
    });
  }

  const resourceImg = RESOURCE_META[autoForge.resourceType].image;

  // Conversion summary row (shown when running or done)
  const conversionRow = autoForge.endsAt && (
    <div className="flex items-center gap-1">
      <div className="relative h-4 w-4 shrink-0">
        <Image src={toPublicImageUrl(resourceImg)} alt={RESOURCE_META[autoForge.resourceType].label} fill sizes="16px" className="object-contain" />
      </div>
      {autoForge.resourceAmount > 0 && (
        <span className="text-[9px] text-white/80">{autoForge.resourceAmount.toLocaleString()}</span>
      )}
      <span className="text-[9px] text-white/80">→</span>
      <div className="relative h-4 w-4 shrink-0">
        <Image src={toPublicImageUrl("images/other/gold-c.png")} alt="Capital Gold" fill sizes="16px" className="object-contain" />
      </div>
      {autoForge.capitalGoldOutput > 0 && (
        <span className="text-[9px] font-bold text-accent">{autoForge.capitalGoldOutput.toLocaleString()}</span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-1.5 min-w-36">
      <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Auto Forge</span>

      {!autoForge.endsAt ? (
        // Not started — setup form
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1">
            {(Object.keys(RESOURCE_META) as ForgeResourceType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setResourceType(type)}
                title={RESOURCE_META[type].label}
                className={`cursor-pointer relative h-5 w-5 rounded transition-opacity ${resourceType === type ? "opacity-100 ring-1 ring-accent" : "opacity-50 hover:opacity-80"}`}
              >
                <Image src={toPublicImageUrl(RESOURCE_META[type].image)} alt={RESOURCE_META[type].label} fill sizes="20px" className="object-contain" />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <div className="relative h-4 w-4 shrink-0">
              <Image src={toPublicImageUrl(RESOURCE_META[resourceType].image)} alt="resource" fill sizes="16px" className="object-contain" />
            </div>
            <input
              type="number"
              min={0}
              value={resourceAmount}
              onChange={(e) => setResourceAmount(e.target.value)}
              className="w-14 rounded border border-secondary/80 bg-white/10 px-1 py-0.5 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-accent/80"
              placeholder="amount"
            />
          </div>
          <div className="flex items-center gap-1">
            <div className="relative h-4 w-4 shrink-0">
              <Image src={toPublicImageUrl("images/other/gold-c.png")} alt="Capital Gold" fill sizes="16px" className="object-contain" />
            </div>
            <input
              type="number"
              min={0}
              value={capitalGoldOutput}
              onChange={(e) => setCapitalGoldOutput(e.target.value)}
              className="w-14 rounded border border-secondary/80 bg-white/10 px-1 py-0.5 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-accent/80"
              placeholder="output"
            />
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number" min={0} max={99} value={durH}
              onChange={(e) => setDurH(e.target.value)}
              className="w-10 rounded border border-secondary/80 bg-white/10 px-1 py-0.5 text-center text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-accent/80"
              placeholder="HH"
            />
            <span className="text-[10px] text-white/80">h</span>
            <input
              type="number" min={0} max={59} value={durM}
              onChange={(e) => setDurM(e.target.value)}
              className="w-10 rounded border border-secondary/80 bg-white/10 px-1 py-0.5 text-center text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-accent/80"
              placeholder="MM"
            />
            <span className="text-[10px] text-white/80">m</span>
          </div>
          <button
            type="button"
            onClick={handleStart}
            className="cursor-pointer w-full rounded bg-accent px-2 py-1 text-[10px] font-bold text-primary hover:bg-accent/80"
          >
            Start
          </button>
        </div>
      ) : isDone ? (
        // Done
        <div className="flex flex-col gap-1">
          {conversionRow}
          <span className="text-[11px] font-extrabold text-green-400">Done!</span>
          <button type="button" onClick={onStop}
            className="cursor-pointer w-full rounded bg-white/10 px-2 py-1 text-[10px] text-white/80 hover:bg-white/20">
            Reset
          </button>
        </div>
      ) : (
        // Running
        <div className="flex flex-col gap-1">
          {conversionRow}
          <span className="text-[11px] font-extrabold tabular-nums text-white">{formatMs(display)}</span>
          <button type="button" onClick={onStop}
            className="cursor-pointer w-full rounded bg-white/10 px-2 py-1 text-[10px] text-white/80 hover:bg-white/20">
            Stop
          </button>
        </div>
      )}
    </div>
  );
}


const HELPER_CHIPS: { key: Exclude<keyof HelpersData, "prospectorUnlocked">; label: string; image: string }[] = [
  { key: "buildersApprentice", label: "Builder's App", image: "images/home/other/helpers/builders-apprentice/normal.png" },
  { key: "labAssistant",       label: "Lab Asst",      image: "images/home/other/helpers/lab-assistant/normal.png" },
  { key: "alchemist",          label: "Alchemist",     image: "images/home/other/helpers/alchemist/normal.png" },
  { key: "prospector",         label: "Prospector",    image: "images/home/other/helpers/prospector/normal.png" },
];

const DAILY_CHIPS: { key: "starBonus" | "capitalGold"; label: string; image: string }[] = [
  { key: "starBonus",   label: "Star Bonus",    image: "images/season-pass/challenges/star-bonus.png" },
  { key: "capitalGold", label: "Capital Gold",  image: "images/other/gold-c.png" },
];

export function DailiesSection({ dailies, playthroughId }: DailiesSectionProps) {
  const { updatePlaythrough } = usePlaythrough();

  // Auto-reset Gold Pass if month has changed
  useEffect(() => {
    const currentMonthKey = getCurrentMonthKey();
    if (dailies.goldPass.monthKey !== currentMonthKey) {
      updatePlaythrough(playthroughId, {
        dailies: {
          ...dailies,
          goldPass: { ...dailies.goldPass, builderBoostPct: 0, researchBoostPct: 0, monthKey: currentMonthKey },
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateHelper(key: Exclude<keyof HelpersData, "prospectorUnlocked">, patch: Partial<DailyTimerData>) {
    const existing = dailies.helpers[key] as DailyTimerData;
    updatePlaythrough(playthroughId, {
      dailies: {
        ...dailies,
        helpers: { ...dailies.helpers, [key]: { ...existing, ...patch } },
      },
    });
  }

  function updateDaily(key: "starBonus" | "capitalGold", patch: Partial<DailyTimerData>) {
    updatePlaythrough(playthroughId, {
      dailies: { ...dailies, [key]: { ...dailies[key], ...patch } },
    });
  }

  function handleHelperCollect(key: Exclude<keyof HelpersData, "prospectorUnlocked">, resetTime: string | null) {
    updateHelper(key, {
      lastCollectedAt: new Date().toISOString(),
      ...(resetTime !== null ? { resetTime } : {}),
    });
  }

  function handleDailyCollect(key: "starBonus" | "capitalGold", resetTime: string | null) {
    updateDaily(key, {
      lastCollectedAt: new Date().toISOString(),
      ...(resetTime !== null ? { resetTime } : {}),
    });
  }

  return (
    <section className="mb-6">
      <div className="flex items-start gap-4 overflow-x-auto rounded-xl border border-secondary/80 bg-primary px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        <div className="flex shrink-0 flex-col gap-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Helpers</span>
          <div className="flex gap-4">
            {HELPER_CHIPS.map(({ key, label, image }) =>
              key === "prospector" && !dailies.helpers.prospectorUnlocked ? (
                <LockedChip key={key} label={label} imageUrl={toPublicImageUrl(image)} />
              ) : (
                <TimerChip
                  key={key}
                  label={label}
                  imageUrl={toPublicImageUrl(image)}
                  timer={dailies.helpers[key]}
                  onCollect={(rt) => handleHelperCollect(key, rt)}
                  onAdjust={(rt) => updateHelper(key, { resetTime: rt })}
                />
              )
            )}
          </div>
        </div>

        <Divider />

        <div className="flex shrink-0 flex-col gap-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Daily</span>
          <div className="flex gap-4">
            {DAILY_CHIPS.map(({ key, label, image }) => (
              <TimerChip
                key={key}
                label={label}
                imageUrl={toPublicImageUrl(image)}
                timer={dailies[key]}
                onCollect={(rt) => handleDailyCollect(key, rt)}
                onAdjust={(rt) => updateDaily(key, { resetTime: rt })}
              />
            ))}
          </div>
        </div>

        <Divider />

        <div className="shrink-0">
          <GoldPassDisplay goldPass={dailies.goldPass} />
        </div>

        {dailies.goldPass.autoForgeUnlocked && (
          <>
            <Divider />
            <div className="shrink-0">
              <AutoForgeChip
                autoForge={dailies.autoForge}
                builderBoostPct={dailies.goldPass.builderBoostPct}
                onStart={(data) =>
                  updatePlaythrough(playthroughId, {
                    dailies: { ...dailies, autoForge: data },
                  })
                }
                onStop={() =>
                  updatePlaythrough(playthroughId, {
                    dailies: { ...dailies, autoForge: { ...dailies.autoForge, endsAt: null } },
                  })
                }
              />
            </div>
          </>
        )}

      </div>
    </section>
  );
}
