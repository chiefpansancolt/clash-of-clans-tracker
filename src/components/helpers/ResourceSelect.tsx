"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { RiArrowDownSLine } from "react-icons/ri";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";

export interface ResourceSelectOption<T extends string = string> {
  value: T;
  label: string;
  image: string;
  color?: string;
}

interface Props<T extends string> {
  options: ResourceSelectOption<T>[];
  value: T;
  disabledValue?: T;
  label?: string;
  onChange: (value: T) => void;
}

export const ResourceSelect = <T extends string>({ options, value, disabledValue, label, onChange }: Props<T>) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="flex flex-col gap-1 flex-1">
      {label && <span className="text-[10px] text-white/80">{label}</span>}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2 rounded-lg border border-secondary/80 bg-white/10 px-2.5 py-1.5 text-[11px] text-white hover:bg-white/15 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent/80"
        >
          <span className="relative inline-block h-4 w-4 shrink-0">
            <Image src={toPublicImageUrl(selected.image)} alt={selected.label} fill className="object-contain" sizes="16px" />
          </span>
          <span className={`flex-1 text-left font-semibold ${selected.color ?? "text-white"}`}>{selected.label}</span>
          <RiArrowDownSLine size={14} className={`shrink-0 text-white/80 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute left-0 bottom-full z-50 mb-1 w-full rounded-lg border border-secondary/80 bg-primary shadow-xl overflow-hidden">
            {options.map((opt) => {
              const isDisabled = opt.value === disabledValue;
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`flex w-full items-center gap-2 px-2.5 py-2 text-[11px] transition-colors cursor-pointer ${
                    isDisabled
                      ? "opacity-30 cursor-not-allowed"
                      : isSelected
                      ? "bg-white/15"
                      : "hover:bg-white/10"
                  }`}
                >
                  <span className="relative inline-block h-4 w-4 shrink-0">
                    <Image src={toPublicImageUrl(opt.image)} alt={opt.label} fill className="object-contain" sizes="16px" />
                  </span>
                  <span className={`font-semibold ${opt.color ?? "text-white"}`}>{opt.label}</span>
                  {isDisabled && <span className="ml-auto text-[9px] text-white/80">same as from</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
