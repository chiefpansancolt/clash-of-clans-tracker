"use client";

import Image from "next/image";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { defaultDailies } from "@/lib/services/storage";
import type { GoldPassData } from "@/types/app/playthrough";

const BOOST_OPTIONS = [0, 10, 15, 20] as const;
type BoostPct = (typeof BOOST_OPTIONS)[number];

const GOLD_PASS_PERKS: {
  key: keyof Pick<GoldPassData, "hoggyBankUnlocked" | "gemDonationsUnlocked" | "autoForgeUnlocked" | "requestTimeReductionUnlocked">;
  label: string;
  description: string;
  image: string;
}[] = [
  {
    key: "hoggyBankUnlocked",
    label: "Hoggy Bank",
    description: "Stores resources while you play, collect at season end",
    image: "/images/season-pass/pass-items/hoggy-bank.png",
  },
  {
    key: "gemDonationsUnlocked",
    label: "1-Gem Donations",
    description: "Donate troops and spells for just 1 gem each",
    image: "/images/season-pass/pass-items/perk-1-gem-donations.png",
  },
  {
    key: "autoForgeUnlocked",
    label: "Auto Forge",
    description: "Automatically converts resources to Capital Gold",
    image: "/images/season-pass/pass-items/perk-auto-forge.png",
  },
  {
    key: "requestTimeReductionUnlocked",
    label: "Request Time Reduction",
    description: "Reduces the troop request cooldown timer",
    image: "/images/season-pass/pass-items/perk-request-time-reduction.png",
  },
];

export function SeasonPassPerks() {
  const { activePlaythrough, updatePlaythrough } = usePlaythrough();
  if (!activePlaythrough) return null;

  const dailies = activePlaythrough.dailies ?? defaultDailies;
  const goldPass = dailies.goldPass;

  function patchGoldPass(patch: Partial<GoldPassData>) {
    updatePlaythrough(activePlaythrough!.id, {
      dailies: { ...dailies, goldPass: { ...goldPass, ...patch } },
    });
  }

  function patchHelpers(patch: Partial<typeof dailies.helpers>) {
    updatePlaythrough(activePlaythrough!.id, {
      dailies: { ...dailies, helpers: { ...dailies.helpers, ...patch } },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Boost perks */}
      <div className="rounded-xl border border-secondary/80 bg-primary/40 overflow-hidden">
        <div className="px-4 py-3 border-b border-secondary/80 bg-primary">
          <p className="text-[11px] font-bold uppercase tracking-widest text-accent">Boost Perks</p>
        </div>
        <div className="divide-y divide-secondary/80">
          {(
            [
              {
                key: "builderBoostPct" as const,
                label: "Builder Boost",
                description: "Reduces builder upgrade times",
                image: "/images/season-pass/pass-items/perk-builder-boost.png",
              },
              {
                key: "researchBoostPct" as const,
                label: "Research Boost",
                description: "Reduces lab research times",
                image: "/images/season-pass/pass-items/perk-research-boost.png",
              },
            ] as const
          ).map(({ key, label, description, image }) => {
            const value = goldPass[key] as BoostPct;
            return (
              <div key={key} className="flex items-center gap-3 px-4 py-3">
                <div className="relative h-10 w-10 shrink-0">
                  <Image src={image} alt={label} fill className="object-contain" sizes="40px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-white">{label}</p>
                  <p className="text-[10px] text-white/80">{description}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {BOOST_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => patchGoldPass({ [key]: opt })}
                      className={`cursor-pointer rounded px-2 py-1 text-[11px] font-bold transition-colors ${
                        value === opt
                          ? "bg-accent text-primary"
                          : "bg-white/8 text-white/80 hover:bg-white/15"
                      }`}
                    >
                      {opt}%
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Boolean perks */}
      <div className="rounded-xl border border-secondary/80 bg-primary/40 overflow-hidden">
        <div className="px-4 py-3 border-b border-secondary/80 bg-primary">
          <p className="text-[11px] font-bold uppercase tracking-widest text-accent">Perks</p>
        </div>
        <div className="divide-y divide-secondary/80">
          {GOLD_PASS_PERKS.map(({ key, label, description, image }) => {
            const unlocked = goldPass[key] as boolean;
            return (
              <button
                key={key}
                onClick={() => patchGoldPass({ [key]: !unlocked })}
                className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                  unlocked ? "bg-accent/5 hover:bg-accent/10" : "hover:bg-white/5"
                }`}
              >
                <div className={`relative h-10 w-10 shrink-0 transition-all ${unlocked ? "" : "grayscale opacity-40"}`}>
                  <Image src={image} alt={label} fill className="object-contain" sizes="40px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-bold transition-colors ${unlocked ? "text-white" : "text-white/80"}`}>
                    {label}
                  </p>
                  <p className="text-[10px] text-white/80">{description}</p>
                </div>
                <div className={`h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                  unlocked ? "bg-accent border-accent" : "border-white/30 bg-transparent"
                }`}>
                  {unlocked && (
                    <svg viewBox="0 0 10 10" className="h-3 w-3">
                      <path d="M1.5 5l2.5 2.5 4.5-5" stroke="#1a3869" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
          {(() => {
            const unlocked = dailies.helpers.prospectorUnlocked;
            return (
              <button
                onClick={() => patchHelpers({ prospectorUnlocked: !unlocked })}
                className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                  unlocked ? "bg-accent/5 hover:bg-accent/10" : "hover:bg-white/5"
                }`}
              >
                <div className={`relative h-10 w-10 shrink-0 transition-all ${unlocked ? "" : "grayscale opacity-40"}`}>
                  <Image src="/images/other/avatar-prospector.png" alt="Prospector" fill className="object-contain" sizes="40px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-bold transition-colors ${unlocked ? "text-white" : "text-white/80"}`}>
                    Prospector
                  </p>
                  <p className="text-[10px] text-white/80">Adds a daily resource production bonus</p>
                </div>
                <div className={`h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                  unlocked ? "bg-accent border-accent" : "border-white/30 bg-transparent"
                }`}>
                  {unlocked && (
                    <svg viewBox="0 0 10 10" className="h-3 w-3">
                      <path d="M1.5 5l2.5 2.5 4.5-5" stroke="#1a3869" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
