"use client";

import Image from "next/image";
import { useState } from "react";
import { Tooltip } from "flowbite-react";
import { HiClock, HiLockClosed } from "react-icons/hi";
import type { TrackedItem } from "@/types/app/game";
import type { ItemGridProps } from "@/types/components/dashboard";

function ItemCell({
  item,
  iconUrl,
  maxLevel,
  small,
}: {
  item: TrackedItem;
  iconUrl: string;
  maxLevel: number;
  small: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const isLocked = item.level === 0;
  const isMaxed = maxLevel > 0 && item.level >= maxLevel;
  const isUpgrading = !!item.upgrade;

  const sizeClass = small ? "w-12 h-12" : "w-14 h-14";
  const badgeFontClass = small ? "text-[9px]" : "text-[10px]";
  const badgeBg = isMaxed ? "bg-green-500 text-white" : "bg-accent text-primary";

  const tooltipContent = `${item.name} · Lv ${item.level}${maxLevel ? ` / ${maxLevel}` : ""}`;

  return (
    <Tooltip content={tooltipContent} placement="top" style="dark">
      <div
        className={`relative ${sizeClass} flex-shrink-0 cursor-default overflow-hidden rounded-lg border border-secondary/80 bg-primary ${isLocked ? "opacity-50 grayscale" : ""}`}
      >
        {!imgError && iconUrl ? (
          <Image
            src={iconUrl}
            alt={item.name}
            fill
            sizes={small ? "48px" : "56px"}
            className="object-contain p-0.5"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[9px] font-bold text-white/80">
            {item.name.slice(0, 2).toUpperCase()}
          </div>
        )}

        <span
          className={`absolute bottom-0 left-0 min-w-4.5 rounded-tr rounded-bl px-0.5 text-center font-extrabold leading-none ${badgeFontClass} ${badgeBg}`}
          style={{ paddingTop: 2, paddingBottom: 2 }}
        >
          {isLocked ? "—" : item.level}
        </span>

        {isLocked && (
          <HiLockClosed className="absolute bottom-0.5 right-0.5 h-3 w-3 text-white/80" />
        )}

        {isUpgrading && (
          <HiClock className="absolute top-0.5 right-0.5 h-3 w-3 text-action" />
        )}
      </div>
    </Tooltip>
  );
}

export function ItemGrid({ items, getItemData, small = false }: ItemGridProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const data = getItemData(item.name.toLowerCase());
        return (
          <ItemCell
            key={item.name}
            item={item}
            iconUrl={data?.iconUrl ?? ""}
            maxLevel={data?.maxLevel ?? 0}
            small={small}
          />
        );
      })}
    </div>
  );
}
