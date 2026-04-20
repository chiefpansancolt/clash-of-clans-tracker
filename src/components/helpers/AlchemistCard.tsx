"use client";

import { useState } from "react";
import Image from "next/image";
import { RiArrowRightLine, RiLockLine } from "react-icons/ri";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import {
  getAlchemistData,
  calcAlchemistConversion,
  getAlchemistInputMax,
} from "@/lib/utils/helperHelpers";
import type { AlchemistResourceType } from "@/lib/utils/helperHelpers";
import { ResourceSelect } from "@/components/helpers/ResourceSelect";
import type { ResourceSelectOption } from "@/components/helpers/ResourceSelect";

interface Props {
  level: number | undefined;
  thLevel: number;
  onLevelChange: (level: number) => void;
}

const RESOURCE_OPTIONS: ResourceSelectOption<AlchemistResourceType>[] = [
  { value: "gold",       label: "Gold",        image: "images/other/gold.png",       color: "text-accent" },
  { value: "elixir",     label: "Elixir",      image: "images/other/elixir.png",     color: "text-purple-300" },
  { value: "darkElixir", label: "Dark Elixir", image: "images/other/dark-elixir.png", color: "text-blue-300" },
];

export const AlchemistCard = ({ level, thLevel, onLevelChange }: Props) => {
  const levels = getAlchemistData();
  const minTH = 11;
  const locked = thLevel < minTH;
  const currentLevelData = level ? levels.find((l) => l.level === level) : null;

  const [from, setFrom] = useState<AlchemistResourceType>("gold");
  const [to, setTo] = useState<AlchemistResourceType>("elixir");
  const [inputAmount, setInputAmount] = useState(0);

  const handleFromChange = (newFrom: AlchemistResourceType) => {
    setFrom(newFrom);
    if (newFrom === to) {
      const next = RESOURCE_OPTIONS.find((o) => o.value !== newFrom)!;
      setTo(next.value);
    }
    setInputAmount(0);
  };

  const handleToChange = (newTo: AlchemistResourceType) => {
    if (newTo === from) return;
    setTo(newTo);
  };

  const maxInput = currentLevelData && level ? getAlchemistInputMax(from, level) : 0;
  const output = currentLevelData && level ? calcAlchemistConversion(inputAmount, from, to, level) : 0;
  const fromMeta = RESOURCE_OPTIONS.find((o) => o.value === from)!;
  const toMeta = RESOURCE_OPTIONS.find((o) => o.value === to)!;

  return (
    <div className={`rounded-xl border border-secondary/80 bg-primary overflow-hidden ${locked ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-secondary/80">
        <div className="relative h-10 w-10 shrink-0">
          <Image
            src={toPublicImageUrl("images/home/other/helpers/alchemist/normal.png")}
            alt="Alchemist"
            fill
            sizes="40px"
            className="object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-white">Alchemist</p>
          {locked && (
            <p className="flex items-center gap-1 text-[10px] text-white/80">
              <RiLockLine size={10} /> Unlocks at TH{minTH}
            </p>
          )}
        </div>
      </div>

      {!locked && (
        <>
          <div className="px-4 py-3 border-b border-secondary/80">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-accent/80">Level</p>
            <div className="flex flex-wrap gap-1.5">
              {levels.map((l) => {
                const available = thLevel >= l.townHallRequired;
                return (
                  <div key={l.level} className="relative group">
                    <button
                      type="button"
                      disabled={!available}
                      onClick={() => { onLevelChange(l.level); setInputAmount(0); }}
                      className={`rounded-full px-3 py-1 text-[10px] font-bold transition-colors border cursor-pointer ${
                        level === l.level
                          ? "bg-primary/80 border-accent/40 text-white"
                          : available
                          ? "bg-white/6 border-white/10 text-gray-600 hover:bg-white/10"
                          : "bg-white/4 border-white/10 text-white/30 cursor-not-allowed"
                      }`}
                    >
                      {l.level}
                    </button>
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 hidden group-hover:flex items-center gap-1 rounded-md bg-gray-900 px-2 py-1 shadow-lg whitespace-nowrap">
                      <span className="relative inline-block h-3 w-3 shrink-0">
                        <Image src="/images/other/gem.png" alt="Gems" fill className="object-contain" sizes="12px" />
                      </span>
                      <span className="text-[10px] text-white">{l.upgradeCost.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {currentLevelData && (
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                <div>
                  <p className="text-[10px] text-white/80">Gold/Elixir max</p>
                  <p className="text-[11px] font-bold text-white">{currentLevelData.goldElixirConversionMax.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/80">Dark Elixir max</p>
                  <p className="text-[11px] font-bold text-blue-300">{currentLevelData.darkElixirConversionMax.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-white/80">Conversion bonus</p>
                  <p className="text-[11px] font-bold text-accent">+{currentLevelData.conversionBonusPercent}%</p>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent/80">Calculator</p>
              {currentLevelData && (
                <p className="text-[10px] text-white/80">max <span className="font-semibold text-white">{maxInput.toLocaleString()}</span></p>
              )}
            </div>

            {!currentLevelData ? (
              <p className="text-[11px] text-white/80">Select your level to use the calculator.</p>
            ) : (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <ResourceSelect
                    options={RESOURCE_OPTIONS}
                    value={from}
                    label="From"
                    onChange={handleFromChange}
                  />
                  <RiArrowRightLine size={16} className="text-white/80 shrink-0 mt-4" />
                  <ResourceSelect
                    options={RESOURCE_OPTIONS}
                    value={to}
                    disabledValue={from}
                    label="To"
                    onChange={handleToChange}
                  />
                </div>

                <input
                  type="range"
                  min={0}
                  max={maxInput}
                  step={from === "darkElixir" ? 1 : 1000}
                  value={Math.min(inputAmount, maxInput)}
                  onChange={(e) => setInputAmount(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="mt-2 flex items-center gap-2">
                  <span className="relative inline-block h-4 w-4 shrink-0">
                    <Image src={toPublicImageUrl(fromMeta.image)} alt={fromMeta.label} fill className="object-contain" sizes="16px" />
                  </span>
                  <span className={`text-[11px] font-bold ${fromMeta.color}`}>{Math.min(inputAmount, maxInput).toLocaleString()}</span>
                  <RiArrowRightLine size={12} className="text-white/80 shrink-0" />
                  <span className="relative inline-block h-4 w-4 shrink-0">
                    <Image src={toPublicImageUrl(toMeta.image)} alt={toMeta.label} fill className="object-contain" sizes="16px" />
                  </span>
                  <span className={`text-[11px] font-extrabold ${toMeta.color}`}>{output.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
