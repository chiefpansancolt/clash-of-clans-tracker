"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { nanoid } from "nanoid";
import { RiCloseLine } from "react-icons/ri";
import {
  getDefensesAtTH,
  getArmyBuildingsAtTH,
  getResourceBuildingsAtTH,
  getTrapsAtTH,
  getHeroesAtTH,
  getGuardiansAtTH,
  getCraftedDefenses,
  getTroopsAtTH,
  getSpellsAtTH,
  getSiegeMachinesAtTH,
  getPetsAtTH,
} from "@/lib/utils/massEditHelpers";
import {
  getBuildingUpgradeSteps,
  getHeroUpgradeSteps,
  getResearchUpgradeSteps,
  getPetUpgradeSteps,
  getCraftedDefenseUpgradeSteps,
  getCraftedDefenseImageUrl,
  isActiveUpgrade,
  formatFullNumber,
  formatBuildTime,
  applyBoost,
  applyBuilderBoostCost,
  applyResearchBoostCost,
  getTownHallUpgradeStep,
  getTownHallWeaponInfo,
  getTownHallWeaponUpgradeSteps,
  getTownHallImageUrl,
  getTownHallMaxLevel,
} from "@/lib/utils/upgradeHelpers";
import type { HomeVillageData } from "@/types/app/game";
import type { BuilderQueueItem, ResearchQueueItem, PetQueueItem } from "@/types/app/queue";
import type {
  AvailableBuilderItem,
  AvailableResearchItem,
  AvailablePetItem,
  BuilderPanelProps,
  ResearchPanelProps,
  PetPanelProps,
  PanelMode,
  BuilderCategory,
  ResearchCategory,
} from "@/types/components/queue";

const RESOURCE_ICONS: Record<string, string> = {
  Gold: "/images/other/gold.png",
  Elixir: "/images/other/elixir.png",
  "Dark Elixir": "/images/other/dark-elixir.png",
  "Builder Gold": "/images/other/gold-b.png",
  "Builder Elixir": "/images/other/elixir-b.png",
  Gems: "/images/other/gem.png",
};



export const AvailableBuilderUpgradesPanel = ({ hv, slots, targetSlotId, builderBoostPct = 0, onAdd, onClose }: BuilderPanelProps) => {
  const [category, setCategory] = useState<BuilderCategory>("all");
  const [search, setSearch] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<number>(targetSlotId ?? slots[0]?.id ?? 1);
  const thLevel = hv.townHallLevel;

  const activeUpgradeBuilderIds = useMemo(() => {
    const ids = new Set<number>();
    for (const record of [hv.defenses, hv.armyBuildings, hv.resourceBuildings, hv.traps] as any[]) {
      for (const instances of Object.values(record) as any[][]) {
        for (const inst of instances) {
          if (inst.upgrade && isActiveUpgrade(inst.upgrade.finishesAt)) {
            ids.add(inst.upgrade.builderId);
          }
        }
      }
    }
    for (const hero of hv.heroes) {
      if (hero.upgrade && isActiveUpgrade(hero.upgrade.finishesAt)) {
        ids.add(hero.upgrade.builderId);
      }
    }
    return ids;
  }, [hv]);

  const available = useMemo<AvailableBuilderItem[]>(() => {
    const queuedKeys = new Set<string>();
    for (const queue of Object.values(hv.builderQueues ?? {})) {
      for (const qi of queue) {
        queuedKeys.add(`${qi.buildingId}:${qi.instanceIndex}:${qi.targetLevel}${qi.isSupercharge ? ":sc" : ""}`);
      }
    }

    const items: AvailableBuilderItem[] = [];

    const guardianIds = new Set(getGuardiansAtTH(thLevel).map((g) => g.id));

    const addBuildings = (
      defs: ReturnType<typeof getDefensesAtTH>,
      catKey: BuilderQueueItem["category"],
      recordKey: keyof HomeVillageData,
      isGuardian = false
    ) => {
      for (const b of defs) {
        const record = hv[recordKey] as Record<string, Array<{ level: number; upgrade?: any; superchargeLevel?: number }>>;
        const instances = record[b.id] ?? [];
        for (let i = 0; i < b.instanceCount; i++) {
          const inst = instances[i] ?? { level: 0 };
          const effectiveBuildingLevel = (inst.upgrade && isActiveUpgrade(inst.upgrade.finishesAt)) ? inst.level + 1 : inst.level;
          const superchargeLevel = inst.superchargeLevel ?? 0;
          const steps = getBuildingUpgradeSteps(b.id, effectiveBuildingLevel, thLevel, i, superchargeLevel);
          for (const step of steps) {
            const scKey = step.isSupercharge ? ":sc" : "";
            if (queuedKeys.has(`${b.id}:${i}:${step.level}${scKey}`)) continue;
            items.push({
              buildingId: b.id,
              instanceIndex: i,
              name: b.name,
              imageUrl: step.imageUrl || (step.level > 1 ? b.imageUrl : ""),
              category: catKey,
              currentLevel: step.level - 1,
              nextLevel: step.level,
              cost: step.cost,
              costResource: step.costResource,
              durationMs: step.durationMs,
              isGuardian,
              isSupercharge: step.isSupercharge,
            });
          }
        }
      }
    };

    addBuildings(getDefensesAtTH(thLevel), "defenses", "defenses");
    addBuildings(getArmyBuildingsAtTH(thLevel), "armyBuildings", "armyBuildings");
    addBuildings(getResourceBuildingsAtTH(thLevel), "resourceBuildings", "resourceBuildings");
    addBuildings(getTrapsAtTH(thLevel), "traps", "traps");
    addBuildings(getGuardiansAtTH(thLevel), "defenses", "defenses", true);

    for (const h of getHeroesAtTH(thLevel)) {
      const saved = hv.heroes.find((hero) => hero.name === h.name);
      const currentLevel = saved?.level ?? 0;
      const effectiveHeroLevel = (saved?.upgrade && isActiveUpgrade(saved.upgrade.finishesAt)) ? currentLevel + 1 : currentLevel;
      if (effectiveHeroLevel >= h.maxLevel) continue;
      const steps = getHeroUpgradeSteps(h.id, effectiveHeroLevel, thLevel);
      for (const step of steps) {
        if (queuedKeys.has(`${h.id}:0:${step.level}`)) continue;
        items.push({
          buildingId: h.id,
          instanceIndex: 0,
          name: h.name,
          imageUrl: step.imageUrl || h.imageUrl,
          category: "heroes",
          currentLevel: step.level - 1,
          nextLevel: step.level,
          cost: step.cost,
          costResource: step.costResource,
          durationMs: step.durationMs,
        });
      }
    }

    // TH weapon upgrade (TH17 Inferno Artillery)
    const weaponInfo = getTownHallWeaponInfo(thLevel);
    const weaponLevel = hv.townHallWeaponLevel ?? (thLevel === 17 ? 1 : 0);
    if (weaponInfo && weaponLevel < weaponInfo.maxLevel && !isActiveUpgrade(hv.townHallWeaponUpgrade?.finishesAt)) {
      const steps = getTownHallWeaponUpgradeSteps(thLevel, weaponLevel);
      for (const step of steps) {
        if (queuedKeys.has(`town-hall-weapon:0:${step.level}`)) continue;
        items.push({
          buildingId: "town-hall-weapon",
          instanceIndex: 0,
          name: weaponInfo.name,
          imageUrl: step.imageUrl || weaponInfo.imageUrl,
          category: "townHall",
          currentLevel: step.level - 1,
          nextLevel: step.level,
          cost: step.cost,
          costResource: step.costResource,
          durationMs: step.durationMs,
        });
      }
    }

    // Next TH upgrade
    const maxTH = getTownHallMaxLevel();
    if (thLevel < maxTH && !isActiveUpgrade(hv.townHallUpgrade?.finishesAt) && !queuedKeys.has(`town-hall:0:${thLevel + 1}`)) {
      const step = getTownHallUpgradeStep(thLevel);
      if (step) {
        items.push({
          buildingId: "town-hall",
          instanceIndex: 0,
          name: `Town Hall ${thLevel + 1}`,
          imageUrl: getTownHallImageUrl(thLevel + 1),
          category: "townHall",
          currentLevel: thLevel,
          nextLevel: thLevel + 1,
          cost: step.cost,
          costResource: step.costResource,
          durationMs: step.durationMs,
        });
      }
    }

    if (thLevel >= 18) {
      for (const cd of getCraftedDefenses()) {
        const saved = hv.craftedDefenses?.[cd.id];
        const imageUrl = getCraftedDefenseImageUrl(cd.id);
        cd.modules.forEach((mod, moduleIndex) => {
          const activeUpgrade = saved?.moduleUpgrades?.[moduleIndex];
          if (activeUpgrade) return;
          const currentLevel = saved?.modules[moduleIndex] ?? 0;
          if (currentLevel >= mod.maxLevel) return;
          const steps = getCraftedDefenseUpgradeSteps(cd.id, moduleIndex, currentLevel);
          for (const step of steps) {
            if (queuedKeys.has(`${cd.id}:${moduleIndex}:${step.level}`)) continue;
            items.push({
              buildingId: cd.id,
              instanceIndex: moduleIndex,
              name: `${cd.name} — ${mod.name}`,
              imageUrl: step.imageUrl || imageUrl,
              category: "craftedDefenses",
              currentLevel: step.level - 1,
              nextLevel: step.level,
              cost: step.cost,
              costResource: step.costResource,
              durationMs: step.durationMs,
              isCrafted: true,
            });
          }
        });
      }
    }

    return items;
  }, [hv, thLevel]);

  const filtered = useMemo(() => {
    return available.filter((it) => {
      if (category === "guardians") return it.isGuardian === true && (!search || it.name.toLowerCase().includes(search.toLowerCase()));
      if (category === "craftedDefenses") return it.isCrafted === true && (!search || it.name.toLowerCase().includes(search.toLowerCase()));
      if (category === "supercharges") return it.isSupercharge === true && (!search || it.name.toLowerCase().includes(search.toLowerCase()));
      if (category === "defenses") { if (it.isGuardian || it.isCrafted || it.isSupercharge || it.category !== "defenses") return false; }
      else if (category !== "all" && it.category !== category) return false;
      if (search && !it.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [available, category, search]);

  const multiInstanceIds = useMemo(() => {
    const seen = new Set<string>();
    const multi = new Set<string>();
    for (const it of available) {
      if (seen.has(it.buildingId)) multi.add(it.buildingId);
      else seen.add(it.buildingId);
    }
    return multi;
  }, [available]);

  const hasSupercharges = available.some((it) => it.isSupercharge);

  const categories: { key: BuilderCategory; label: string }[] = [
    { key: "all", label: "All" },
    { key: "defenses", label: "Defenses" },
    ...(thLevel >= 18 ? [{ key: "guardians" as BuilderCategory, label: "Guardians" }] : []),
    ...(thLevel >= 18 ? [{ key: "craftedDefenses" as BuilderCategory, label: "Crafted Defenses" }] : []),
    { key: "armyBuildings", label: "Army" },
    { key: "resourceBuildings", label: "Resources" },
    { key: "traps", label: "Traps" },
    { key: "heroes", label: "Heroes" },
    { key: "townHall", label: "Town Hall" },
    ...(hasSupercharges ? [{ key: "supercharges" as BuilderCategory, label: "Supercharge" }] : []),
  ];

  const handleAdd = (it: AvailableBuilderItem)=> {
    const item: BuilderQueueItem = {
      id: nanoid(),
      name: it.name,
      targetLevel: it.nextLevel,
      durationMs: applyBoost(it.durationMs, builderBoostPct),
      cost: applyBuilderBoostCost(it.cost, builderBoostPct),
      costResource: it.costResource,
      imageUrl: it.imageUrl,
      category: it.category,
      buildingId: it.buildingId,
      instanceIndex: it.instanceIndex,
      isSupercharge: it.isSupercharge,
    };
    onAdd(item, selectedSlotId);
  }

  return (
    <SlidePanel onClose={onClose} title="Add Upgrade" subtitle={`TH${thLevel} available`}>
      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5 px-3 py-2 border-b border-secondary/80">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`rounded-full px-3 py-1 text-[10px] font-bold cursor-pointer transition-colors ${
              category === c.key
                ? "bg-primary/80 border border-accent/40 text-white"
                : "bg-white/6 border border-white/10 text-white/80 hover:bg-white/10"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-secondary/80">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/6 px-3 py-1.5 text-[12px] text-white placeholder:text-white/80 outline-none focus:border-accent/40"
        />
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-[11px] text-white/80">No upgrades available</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {filtered.map((it) => (
              <div
                key={`${it.buildingId}-${it.instanceIndex}-${it.nextLevel}${it.isSupercharge ? ":sc" : ""}`}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors ${it.isSupercharge ? "hover:bg-cyan-400/5" : "hover:bg-white/5"}`}
              >
                <div className="relative shrink-0">
                  {it.imageUrl ? (
                    <div className={`relative h-11 w-11 overflow-hidden rounded ${it.isSupercharge ? "border border-cyan-400/80" : ""}`}>
                      <Image src={it.imageUrl} alt={it.name} fill className="object-contain" sizes="44px" />
                    </div>
                  ) : (
                    <div className="h-11 w-11 shrink-0 rounded bg-white/6" />
                  )}
                  {it.isSupercharge && (
                    <div className="absolute -top-1 -right-1 h-4 w-4">
                      <Image src="/images/other/supercharge.png" alt="Supercharge" fill className="object-contain" sizes="16px" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-bold truncate ${it.isSupercharge ? "text-cyan-300" : "text-white"}`}>
                    {it.name}{multiInstanceIds.has(it.buildingId) ? ` #${it.instanceIndex + 1}` : ""}
                  </p>
                  <p className="text-[10px] text-white/80">{it.currentLevel}→{it.nextLevel}</p>
                  <p className="flex items-center gap-0.5 text-[10px] text-white/80">
                    {RESOURCE_ICONS[it.costResource] && (
                      <span className="relative inline-block h-3 w-3 shrink-0">
                        <Image src={RESOURCE_ICONS[it.costResource]} alt={it.costResource} fill className="object-contain" sizes="12px" />
                      </span>
                    )}
                    {it.costResource === "Gems" ? (
                      <span>Gems</span>
                    ) : builderBoostPct > 0 ? (
                      <span className="text-accent font-bold">{formatFullNumber(applyBuilderBoostCost(it.cost, builderBoostPct))}</span>
                    ) : (
                      <span>{formatFullNumber(it.cost)}</span>
                    )}
                  </p>
                  {it.durationMs > 0 && (() => {
                    const boostedMs = applyBoost(it.durationMs, builderBoostPct);
                    const totalMins = Math.floor(boostedMs / 60_000);
                    const label = formatBuildTime({ days: Math.floor(totalMins / 1440), hours: Math.floor((totalMins % 1440) / 60), minutes: totalMins % 60 });
                    return (
                      <p className={`text-[10px] font-bold ${builderBoostPct > 0 ? "text-accent" : "text-white/80"}`}>
                        {label}{builderBoostPct > 0 ? ` (−${builderBoostPct}%)` : ""}
                      </p>
                    );
                  })()}
                </div>
                <button
                  onClick={() => handleAdd(it)}
                  className="shrink-0 cursor-pointer rounded border border-accent/80 bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent hover:bg-accent/25 transition-colors"
                >
                  +
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-secondary/80 bg-primary/50 px-3 py-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/80">Add to builder</p>
        <div className="flex flex-wrap gap-1.5">
          {slots.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSlotId(s.id)}
              className={`rounded-lg px-3 py-1.5 text-[10px] font-bold cursor-pointer transition-colors border ${
                selectedSlotId === s.id
                  ? "bg-accent border-accent text-primary"
                  : s.busy
                  ? "bg-white/4 border-white/10 text-white/80"
                  : "bg-primary/60 border-accent/80 text-white hover:border-accent"
              }`}
            >
              {s.label.replace("Builder ", "B")}
            </button>
          ))}
        </div>
      </div>
    </SlidePanel>
  );
}

export const AvailableResearchUpgradesPanel = ({ hv, slots, targetSlotId, researchBoostPct = 0, onAdd, onUnlock, onClose }: ResearchPanelProps) => {
  const [category, setCategory] = useState<ResearchCategory>("all");
  const [search, setSearch] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<number>(targetSlotId ?? slots[0]?.id ?? 1);
  const thLevel = hv.townHallLevel;

  const available = useMemo<AvailableResearchItem[]>(() => {
    const queuedKeys = new Set<string>();
    for (const queue of Object.values(hv.researchQueue ?? {})) {
      for (const qi of queue) {
        queuedKeys.add(`${qi.name}:${qi.targetLevel}`);
      }
    }

    const items: AvailableResearchItem[] = [];
    const activeNames = new Set(
      [...hv.troops, ...hv.spells, ...hv.siegeMachines]
        .filter((t) => isActiveUpgrade((t as any).upgrade?.finishesAt))
        .map((t) => t.name.toLowerCase())
    );

    const addItems = (
      defs: ReturnType<typeof getTroopsAtTH>,
      trackedArr: typeof hv.troops,
      catKey: ResearchQueueItem["category"]
    ) => {
      for (const def of defs) {
        if (activeNames.has(def.name.toLowerCase())) continue;
        const saved = trackedArr.find((t) => t.name === def.name);
        const currentLevel = saved?.level ?? 0;
        if (currentLevel === 0 || currentLevel >= def.maxLevel) continue;
        const steps = getResearchUpgradeSteps(def.name, currentLevel, thLevel);
        for (const step of steps) {
          if (queuedKeys.has(`${def.name}:${step.level}`)) continue;
          items.push({
            name: def.name,
            imageUrl: step.imageUrl || def.imageUrl,
            category: catKey,
            currentLevel: step.level - 1,
            nextLevel: step.level,
            cost: step.cost,
            costResource: step.costResource,
            durationMs: step.durationMs,
            isUnlock: false,
          });
        }
      }
    };

    addItems(getTroopsAtTH(thLevel), hv.troops, "troops");
    addItems(getSpellsAtTH(thLevel) as any, hv.spells, "spells");
    addItems(getSiegeMachinesAtTH(thLevel) as any, hv.siegeMachines, "siegeMachines");

    return items;
  }, [hv, thLevel]);

  const filtered = useMemo(() => {
    return available.filter((it) => {
      if (category !== "all" && it.category !== category) return false;
      if (search && !it.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [available, category, search]);

  const categories: { key: ResearchCategory; label: string }[] = [
    { key: "all", label: "All" },
    { key: "troops", label: "Troops" },
    { key: "spells", label: "Spells" },
    { key: "siegeMachines", label: "Siege" },
  ];

  const handleAdd = (it: AvailableResearchItem)=> {
    const item: ResearchQueueItem = {
      id: nanoid(),
      name: it.name,
      targetLevel: it.nextLevel,
      durationMs: applyBoost(it.durationMs, researchBoostPct),
      cost: applyResearchBoostCost(it.cost, researchBoostPct),
      costResource: it.costResource,
      imageUrl: it.imageUrl,
      category: it.category,
    };
    onAdd(item, selectedSlotId);
  }

  return (
    <SlidePanel onClose={onClose} title="Add Research" subtitle={`TH${thLevel} available`}>
      <div className="flex flex-wrap gap-1.5 px-3 py-2 border-b border-secondary/80">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`rounded-full px-3 py-1 text-[10px] font-bold cursor-pointer transition-colors ${
              category === c.key
                ? "bg-primary/80 border border-accent/40 text-white"
                : "bg-white/6 border border-white/10 text-white/80 hover:bg-white/10"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="px-3 py-2 border-b border-secondary/80">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/6 px-3 py-1.5 text-[12px] text-white placeholder:text-white/80 outline-none focus:border-accent/40"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-[11px] text-white/80">No research available</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {filtered.map((it) => (
              <div
                key={`${it.name}:${it.nextLevel}`}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-white/5 transition-colors"
              >
                {it.imageUrl ? (
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded">
                    <Image src={it.imageUrl} alt={it.name} fill className="object-contain" sizes="44px" />
                  </div>
                ) : (
                  <div className="h-11 w-11 shrink-0 rounded bg-white/6" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">{it.name}</p>
                  <p className="text-[10px] text-white/80">{it.currentLevel}→{it.nextLevel}</p>
                  <p className="flex items-center gap-0.5 text-[10px] text-white/80">
                    {RESOURCE_ICONS[it.costResource] && (
                      <span className="relative inline-block h-3 w-3 shrink-0">
                        <Image src={RESOURCE_ICONS[it.costResource]} alt={it.costResource} fill className="object-contain" sizes="12px" />
                      </span>
                    )}
                    {researchBoostPct > 0 ? (
                      <span className="text-accent font-bold">{formatFullNumber(applyResearchBoostCost(it.cost, researchBoostPct))}</span>
                    ) : (
                      <span>{formatFullNumber(it.cost)}</span>
                    )}
                  </p>
                  {it.durationMs > 0 && (() => {
                    const boostedMs = applyBoost(it.durationMs, researchBoostPct);
                    const totalMins = Math.floor(boostedMs / 60_000);
                    const label = formatBuildTime({ days: Math.floor(totalMins / 1440), hours: Math.floor((totalMins % 1440) / 60), minutes: totalMins % 60 });
                    return (
                      <p className={`text-[10px] font-bold ${researchBoostPct > 0 ? "text-accent" : "text-white/80"}`}>
                        {label}{researchBoostPct > 0 ? ` (−${researchBoostPct}%)` : ""}
                      </p>
                    );
                  })()}
                </div>
                <button
                  onClick={() => handleAdd(it)}
                  className="shrink-0 cursor-pointer rounded border border-accent/80 bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent hover:bg-accent/25 transition-colors"
                >
                  +
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {!targetSlotId && (
        <div className="shrink-0 border-t border-secondary/80 bg-primary/50 px-3 py-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/80">Add to slot</p>
          <div className="flex flex-wrap gap-1.5">
            {slots.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSlotId(s.id)}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-bold cursor-pointer transition-colors border ${
                  selectedSlotId === s.id
                    ? "bg-accent border-accent text-primary"
                    : s.busy
                    ? "bg-white/4 border-white/10 text-white/80"
                    : "bg-primary/60 border-accent/80 text-white hover:border-accent"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </SlidePanel>
  );
}

export const AvailablePetUpgradesPanel = ({ hv, onAdd, onClose }: PetPanelProps) => {
  const [search, setSearch] = useState("");
  const thLevel = hv.townHallLevel;

  const available = useMemo<AvailablePetItem[]>(() => {
    const activeNames = new Set(
      hv.pets
        .filter((p) => isActiveUpgrade((p as any).upgrade?.finishesAt))
        .map((p) => p.name.toLowerCase())
    );

    return getPetsAtTH(thLevel).flatMap((def) => {
      if (activeNames.has(def.name.toLowerCase())) return [];
      const saved = hv.pets.find((p) => p.name === def.name);
      const currentLevel = saved?.level ?? 0;
      if (currentLevel >= def.maxLevel) return [];
      const steps = getPetUpgradeSteps(def.name, currentLevel);
      if (steps.length === 0) return [];
      const step = steps[0];
      return [{
        name: def.name,
        imageUrl: def.imageUrl,
        currentLevel,
        nextLevel: step.level,
        cost: step.cost,
        costResource: step.costResource,
        durationMs: step.durationMs,
      }];
    });
  }, [hv, thLevel]);

  const filtered = useMemo(
    () => available.filter((it) => !search || it.name.toLowerCase().includes(search.toLowerCase())),
    [available, search]
  );

  const handleAdd = (it: AvailablePetItem)=> {
    const item: PetQueueItem = {
      id: nanoid(),
      name: it.name,
      targetLevel: it.nextLevel,
      durationMs: it.durationMs,
      cost: it.cost,
      costResource: it.costResource,
      imageUrl: it.imageUrl,
    };
    onAdd(item);
  }

  return (
    <SlidePanel onClose={onClose} title="Add Pet Upgrade" subtitle={`TH${thLevel} available`}>
      <div className="px-3 py-2 border-b border-secondary/80">
        <input
          type="text"
          placeholder="Search pets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/6 px-3 py-1.5 text-[12px] text-white placeholder:text-white/80 outline-none focus:border-accent/40"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-[11px] text-white/80">No pets available to upgrade</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {filtered.map((it) => (
              <div
                key={it.name}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-white/5 transition-colors"
              >
                {it.imageUrl ? (
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded">
                    <Image src={it.imageUrl} alt={it.name} fill className="object-contain" sizes="44px" />
                  </div>
                ) : (
                  <div className="h-11 w-11 shrink-0 rounded bg-white/6" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">{it.name}</p>
                  <p className="text-[10px] text-white/80">{it.currentLevel}→{it.nextLevel}</p>
                  <p className="flex items-center gap-0.5 text-[10px] text-white/80">
                    {RESOURCE_ICONS[it.costResource] && (
                      <span className="relative inline-block h-3 w-3 shrink-0">
                        <Image src={RESOURCE_ICONS[it.costResource]} alt={it.costResource} fill className="object-contain" sizes="12px" />
                      </span>
                    )}
                    <span>{formatFullNumber(it.cost)}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleAdd(it)}
                  className="shrink-0 cursor-pointer rounded border border-accent/80 bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent hover:bg-accent/25 transition-colors"
                >
                  +
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </SlidePanel>
  );
}

const SlidePanel = ({
  children,
  onClose,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  subtitle?: string;
}) => {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 z-50 flex w-[min(640px,90vw)] flex-col border-l border-secondary/80 bg-[#0f1e36] animate-slide-in-right">
        <div className="flex shrink-0 items-center gap-2 border-b border-secondary/80 px-4 py-3.5">
          <div>
            <p className="text-[14px] font-extrabold text-white">{title}</p>
            {subtitle && <p className="text-[10px] text-white/80">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-white/8 text-white hover:bg-white/15"
          >
            <RiCloseLine size={16} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
