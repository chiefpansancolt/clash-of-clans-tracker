"use client";

import Image from "next/image";
import { useState } from "react";
import { Tooltip } from "flowbite-react";
import { HiClock, HiLockClosed } from "react-icons/hi";
import type { TrackedEquipment } from "@/types/app/game";
import type { HeroCardProps } from "@/types/components/dashboard";

function EquipChip({
  eq,
  data,
}: {
  eq: TrackedEquipment;
  data: { iconUrl: string; maxLevel: number } | undefined;
}) {
  const [imgError, setImgError] = useState(false);
  const isMaxed = data && data.maxLevel > 0 && eq.level >= data.maxLevel;
  const badgeBg = isMaxed ? "bg-green-500 text-white" : "bg-accent text-primary";

  return (
    <Tooltip content={`${eq.name} · Lv ${eq.level}${data?.maxLevel ? ` / ${data.maxLevel}` : ""}`} placement="top" style="dark">
      <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded border border-secondary/80 bg-primary">
        {!imgError && data?.iconUrl ? (
          <Image
            src={data.iconUrl}
            alt={eq.name}
            fill
            sizes="28px"
            className="object-contain p-0.5"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[7px] font-bold text-white/80">
            {eq.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        {/* Level badge — bottom-left */}
        <span
          className={`absolute bottom-0 left-0 min-w-3.5 rounded-tr rounded-bl px-0.5 text-center text-[8px] font-extrabold leading-none ${badgeBg}`}
          style={{ paddingTop: 1, paddingBottom: 1 }}
        >
          {eq.level}
        </span>
      </div>
    </Tooltip>
  );
}

export function HeroCard({ hero, heroIconUrl, maxHeroLevel, getEquipmentData }: HeroCardProps) {
  const [imgError, setImgError] = useState(false);
  const isLocked = hero.level === 0;
  const isMaxed = !isLocked && maxHeroLevel > 0 && hero.level >= maxHeroLevel;
  const isUpgrading = !!hero.upgrade;
  const badgeBg = isMaxed ? "bg-green-500 text-white" : "bg-accent text-primary";

  return (
    <div className={`flex w-27 shrink-0 flex-col items-center rounded-lg border bg-primary px-2 pt-2.5 pb-2 ${isLocked ? "border-white/20 opacity-40" : "border-accent/80"}`}>
      {/* Hero icon */}
      <div className={`relative h-16 w-16 overflow-hidden rounded-lg ring-2 ${isLocked ? "ring-white/20" : "ring-accent/80"}`}>
        {!imgError && heroIconUrl ? (
          <Image
            src={heroIconUrl}
            alt={hero.name}
            fill
            sizes="64px"
            className="object-contain p-0.5"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white/80">
            {hero.name.slice(0, 2).toUpperCase()}
          </div>
        )}

        {/* Level badge — bottom-left */}
        <span
          className={`absolute bottom-0 left-0 min-w-5.5 rounded-tr rounded-bl px-1 text-center text-[11px] font-extrabold leading-none ${badgeBg}`}
          style={{ paddingTop: 2, paddingBottom: 2 }}
        >
          {hero.level}
        </span>

        {/* Lock overlay — bottom-right, only when locked */}
        {isLocked && (
          <HiLockClosed className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 text-white/80" />
        )}

        {/* Upgrading indicator */}
        {isUpgrading && (
          <HiClock className="absolute top-0.5 right-0.5 h-3.5 w-3.5 text-action" />
        )}
      </div>

      {/* Name */}
      <div className="mt-1.5 w-full truncate text-center text-[11px] font-semibold text-white">
        {hero.name.replace(" ", "\u00A0")}
      </div>

      {/* Equipment row */}
      {hero.equipment.length > 0 && (
        <div className="mt-1.5 flex flex-wrap justify-center gap-0.5">
          {hero.equipment.map((eq) => (
            <EquipChip key={eq.name} eq={eq} data={getEquipmentData(eq.name.toLowerCase())} />
          ))}
        </div>
      )}
    </div>
  );
}
