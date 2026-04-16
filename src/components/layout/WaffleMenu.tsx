"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HiViewGrid } from "react-icons/hi";

interface AppItem {
  id: string;
  label: string;
  image: string;
  href: string;
}

const APP_ITEMS: AppItem[] = [
  {
    id: "mass-edit-home",
    label: "Mass Edit Home Village",
    image: "/images/home/town-hall/normal/level-18.png",
    href: "/mass-edit/home",
  },
  {
    id: "mass-edit-builder",
    label: "Mass Edit Builder Base",
    image: "/images/builder/builder-hall/normal/level-10.png",
    href: "#",
  },
  {
    id: "mass-edit-capital",
    label: "Mass Edit Clan Capital",
    image: "/images/clan-capital/halls/capital-hall/normal/level-10.png",
    href: "#",
  },
  {
    id: "clan-mgmt",
    label: "Clan Mgmt",
    image: "/images/clan/badges/level-20.png",
    href: "#",
  },
  {
    id: "potion-boosts",
    label: "Potion Boosts",
    image: "/images/magic-items/potions/builder-potion.png",
    href: "#",
  },
  {
    id: "snack-boosts",
    label: "Snack Boosts",
    image: "/images/magic-items/snacks/builder-bite.png",
    href: "#",
  },
  {
    id: "helpers",
    label: "Helpers",
    image: "/images/other/avatar-prospector.png",
    href: "#",
  },
];

export function WaffleMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const itemClass = "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-center transition-colors hover:bg-secondary/10";

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center justify-center rounded-lg p-2 text-white transition-colors hover:bg-white/20 focus:outline-none"
        aria-label="Open app menu"
      >
        <HiViewGrid className="h-6 w-6" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-secondary/80 bg-highlight shadow-xl">
          {/* Header */}
          <div className="border-b border-secondary/80 px-4 py-2.5">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">Apps</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-3 gap-1 p-3">
            {APP_ITEMS.map((item) =>
              item.href !== "#" ? (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={itemClass}
                >
                  <img src={item.image} alt={item.label} className="h-10 object-contain" />
                  <span className="text-[11px] font-medium leading-tight text-gray-800">
                    {item.label}
                  </span>
                </Link>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOpen(false)}
                  className={itemClass}
                >
                  <img src={item.image} alt={item.label} className="h-10 object-contain" />
                  <span className="text-[11px] font-medium leading-tight text-gray-800">
                    {item.label}
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
