"use client";

import { useState } from "react";
import Image from "next/image";
import { RiArrowRightLine, RiLockLine } from "react-icons/ri";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { getProspectorData, calcProspectorConversion, getProspectorInputMax } from "@/lib/utils/helperHelpers";
import type { OreType } from "@/lib/utils/helperHelpers";
import { ResourceSelect } from "@/components/helpers/ResourceSelect";
import type { ResourceSelectOption } from "@/components/helpers/ResourceSelect";

interface Props {
  thLevel: number;
  prospectorUnlocked: boolean;
}

const ORE_OPTIONS: ResourceSelectOption<OreType>[] = [
  { value: "shiny",  label: "Shiny",  image: "images/other/ore/shiny-ore.png",  color: "text-white" },
  { value: "glowy",  label: "Glowy",  image: "images/other/ore/glowy-ore.png",  color: "text-teal-300" },
  { value: "starry", label: "Starry", image: "images/other/ore/starry-ore.png", color: "text-purple-300" },
];

export const ProspectorCard = ({ thLevel, prospectorUnlocked }: Props) => {
  const data = getProspectorData();
  const minTH = 10;
  const thLocked = thLevel < minTH;
  const locked = thLocked || !prospectorUnlocked;

  const [from, setFrom] = useState<OreType>("shiny");
  const [to, setTo] = useState<OreType>("glowy");
  const [inputAmount, setInputAmount] = useState(0);

  const handleFromChange = (newFrom: OreType) => {
    setFrom(newFrom);
    if (newFrom === to) {
      const next = ORE_OPTIONS.find((o) => o.value !== newFrom)!;
      setTo(next.value);
    }
    setInputAmount(0);
  };

  const handleToChange = (newTo: OreType) => {
    if (newTo === from) return;
    setTo(newTo);
  };

  const maxInput = getProspectorInputMax(from);
  const output = calcProspectorConversion(inputAmount, from, to);
  const fromMeta = ORE_OPTIONS.find((o) => o.value === from)!;
  const toMeta = ORE_OPTIONS.find((o) => o.value === to)!;

  const dailyLimits = [
    { key: "shiny" as OreType,  label: "Shiny Ore",  amount: data.shinyOreConversionMax,  image: "images/other/ore/shiny-ore.png" },
    { key: "glowy" as OreType,  label: "Glowy Ore",  amount: data.glowyOreConversionMax,  image: "images/other/ore/glowy-ore.png" },
    { key: "starry" as OreType, label: "Starry Ore", amount: data.starryOreConversionMax, image: "images/other/ore/starry-ore.png" },
  ];

  return (
    <div className={`rounded-xl border border-secondary/80 bg-primary overflow-hidden ${locked ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-secondary/80">
        <div className="relative h-10 w-10 shrink-0">
          <Image
            src={toPublicImageUrl("images/home/other/helpers/prospector/normal.png")}
            alt="Prospector"
            fill
            sizes="40px"
            className="object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-white">Prospector</p>
          {thLocked ? (
            <p className="flex items-center gap-1 text-[10px] text-white/80">
              <RiLockLine size={10} /> Unlocks at TH{minTH}
            </p>
          ) : !prospectorUnlocked ? (
            <p className="flex items-center gap-1 text-[10px] text-white/80">
              <RiLockLine size={10} /> Locked (Season Challenge Points)
            </p>
          ) : (
            <p className="text-[10px] text-white/80">Level 1</p>
          )}
        </div>
      </div>

      {!locked && (
        <>
          <div className="px-4 py-3 border-b border-secondary/80">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-accent/80">Daily Conversion Limits</p>
            <div className="flex flex-col gap-2">
              {dailyLimits.map(({ key, label, amount, image }) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="relative h-4 w-4 shrink-0">
                    <Image src={toPublicImageUrl(image)} alt={label} fill sizes="16px" className="object-contain" />
                  </div>
                  <span className="flex-1 text-[11px] text-white/80">{label}</span>
                  <span className="text-[11px] font-extrabold text-white">{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent/80">Calculator</p>
              <p className="text-[10px] text-white/80">max <span className="font-semibold text-white">{maxInput.toLocaleString()}</span></p>
            </div>

            <div className="mb-3 flex items-center gap-2">
              <ResourceSelect
                options={ORE_OPTIONS}
                value={from}
                label="From"
                onChange={handleFromChange}
              />
              <RiArrowRightLine size={16} className="text-white/80 shrink-0 mt-4" />
              <ResourceSelect
                options={ORE_OPTIONS}
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
              step={1}
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
          </div>
        </>
      )}
    </div>
  );
};
