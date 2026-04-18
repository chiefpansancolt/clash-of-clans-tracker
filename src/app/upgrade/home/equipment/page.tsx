"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { getAllEquipment, getHeroesAtTH } from "@/lib/utils/massEditHelpers";

export default function EquipmentUpgradePage() {
  const router = useRouter();
  const { activePlaythrough, isLoaded } = usePlaythrough();

  useEffect(() => {
    if (!isLoaded) return;
    if (!activePlaythrough) router.push("/playthrough/list");
  }, [isLoaded, activePlaythrough, router]);

  const hv = activePlaythrough?.data.homeVillage;
  const thLevel = hv?.townHallLevel ?? 1;
  const heroes = useMemo(() => getHeroesAtTH(thLevel), [thLevel]);
  const allEquipment = useMemo(() => getAllEquipment(), []);

  if (!activePlaythrough || !hv) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 bg-highlight px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-extrabold text-gray-900">Equipment</h1>
          <span className="text-sm text-gray-500">TH{thLevel}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <p className="mb-3 text-sm text-white/60">
          Equipment levels are set in{" "}
          <Link href="/mass-edit/home" className="text-accent underline">
            Mass Edit
          </Link>
          .
        </p>
        <div className="flex flex-col gap-4">
          {heroes.map((h) => {
            const heroEquip = allEquipment.filter((e) => e.heroId === h.id);
            if (heroEquip.length === 0) return null;
            const savedHero = hv.heroes.find((hero) => hero.name === h.name);
            return (
              <div key={h.id}>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-secondary/80">
                  {h.name}
                </p>
                <div className="flex flex-col gap-2">
                  {heroEquip.map((eq) => {
                    const savedEq = savedHero?.equipment.find((e) => e.name === eq.name);
                    const currentLevel = savedEq?.level ?? 0;
                    return (
                      <div
                        key={eq.name}
                        className="flex items-center gap-3 rounded-lg border border-secondary/80 bg-primary px-3 py-2"
                      >
                        {eq.imageUrl && (
                          <div className="relative h-8 w-8 shrink-0">
                            <Image
                              src={eq.imageUrl}
                              alt={eq.name}
                              fill
                              className="object-contain"
                              sizes="32px"
                            />
                          </div>
                        )}
                        <span className="flex-1 text-sm text-white">{eq.name}</span>
                        <span className="text-sm text-white/60">
                          Lvl {currentLevel}
                          <span className="text-white/40"> / {eq.maxLevel}</span>
                        </span>
                        {currentLevel >= eq.maxLevel && (
                          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-bold text-accent">
                            Max
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
