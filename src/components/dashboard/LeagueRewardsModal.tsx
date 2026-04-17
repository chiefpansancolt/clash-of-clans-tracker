"use client";

import Image from "next/image";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import { RESOURCE_ICONS } from "@/lib/constants/leagueIcons";
import type {
  HomeLeagueData,
  BuilderLeagueData,
  LeagueModalData,
  LeagueRewardsModalProps,
} from "@/types/components/dashboard";

export type { HomeLeagueLoot, HomeLeagueData, BuilderLeagueData, LeagueModalData } from "@/types/components/dashboard";

function ResourceLine({
  icon,
  label,
  value,
}: {
  icon: keyof typeof RESOURCE_ICONS;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <div className="relative h-4 w-4 shrink-0">
          <Image
            src={toPublicImageUrl(RESOURCE_ICONS[icon])}
            alt={label}
            fill
            sizes="16px"
            className="object-contain"
          />
        </div>
        <span className="text-xs text-white/80">{label}</span>
      </div>
      <span className="text-sm font-bold text-accent">{value.toLocaleString()}</span>
    </div>
  );
}

function ModalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-secondary/80">
      <div className="bg-secondary px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{title}</span>
      </div>
      <div className="bg-primary divide-y divide-secondary/80">{children}</div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-secondary/80 bg-primary px-3 py-2">
      <span className="text-xs text-white/80">{label}</span>
      <span className="text-sm font-bold text-accent">{value}</span>
    </div>
  );
}

function LootBlock({ title, ge, de }: { title: string; ge: number | null; de: number | null }) {
  const hasAny = ge != null || (de != null && de > 0);
  if (!hasAny) return null;
  return (
    <div className="px-3 py-2 space-y-1.5">
      <div className="text-[10px] font-semibold text-white/80">{title}</div>
      {ge != null && <ResourceLine icon="gold" label="Gold" value={ge} />}
      {ge != null && <ResourceLine icon="elixir" label="Elixir" value={ge} />}
      {de != null && de > 0 && <ResourceLine icon="darkElixir" label="Dark Elixir" value={de} />}
    </div>
  );
}

function HomeLeagueContent({ league }: { league: HomeLeagueData }) {
  const { loot } = league;
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {league.attacksPerWeek != null && (
          <StatRow label="Attacks per week" value={league.attacksPerWeek} />
        )}
        {league.percentPromoted != null && (
          <StatRow label="Top % promoted" value={`${league.percentPromoted}%`} />
        )}
        {league.percentDemoted != null && (
          <StatRow label="Bottom % demoted" value={`${league.percentDemoted}%`} />
        )}
      </div>

      {loot && (
        <>
          <ModalSection title="Rewards per attack">
            <LootBlock title="Max available loot" ge={loot.maxAvailableLoot.goldAndElixir} de={loot.maxAvailableLoot.darkElixir} />
            <LootBlock title="Max league bonus" ge={loot.maxLeagueBonus.goldAndElixir} de={loot.maxLeagueBonus.darkElixir} />
          </ModalSection>

          <ModalSection title="Weekly star bonus">
            <div className="px-3 py-2 space-y-1.5">
              {loot.starBonus.goldAndElixir != null && (
                <>
                  <ResourceLine icon="gold" label="Gold" value={loot.starBonus.goldAndElixir} />
                  <ResourceLine icon="elixir" label="Elixir" value={loot.starBonus.goldAndElixir} />
                </>
              )}
              {loot.starBonus.darkElixir != null && loot.starBonus.darkElixir > 0 && (
                <ResourceLine icon="darkElixir" label="Dark Elixir" value={loot.starBonus.darkElixir} />
              )}
              {loot.starBonus.shinyOre != null && loot.starBonus.shinyOre > 0 && (
                <ResourceLine icon="shinyOre" label="Shiny Ore" value={loot.starBonus.shinyOre} />
              )}
              {loot.starBonus.glowyOre != null && loot.starBonus.glowyOre > 0 && (
                <ResourceLine icon="glowyOre" label="Glowy Ore" value={loot.starBonus.glowyOre} />
              )}
              {loot.starBonus.starryOre != null && loot.starBonus.starryOre > 0 && (
                <ResourceLine icon="starryOre" label="Starry Ore" value={loot.starBonus.starryOre} />
              )}
            </div>
          </ModalSection>
        </>
      )}
    </div>
  );
}

function BuilderLeagueContent({ league }: { league: BuilderLeagueData }) {
  const trophyRange =
    league.trophyMin != null
      ? league.trophyMax != null
        ? `${league.trophyMin.toLocaleString()} – ${league.trophyMax.toLocaleString()}`
        : `${league.trophyMin.toLocaleString()}+`
      : null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {trophyRange && <StatRow label="Trophy range" value={trophyRange} />}
        {league.starBonus && (
          <StatRow label="Star bonus required" value={`${league.starBonus.starsRequired} ★`} />
        )}
        {league.starBonus && (
          <ModalSection title="Star bonus reward">
            <div className="px-3 py-2 space-y-1.5">
              <ResourceLine icon="goldB" label="Gold" value={league.starBonus.reward} />
              <ResourceLine icon="elixirB" label="Elixir" value={league.starBonus.reward} />
            </div>
          </ModalSection>
        )}
      </div>

      {league.battleResults.length > 0 && (
        <ModalSection title="Battle results">
          <div>
            <div className="grid grid-cols-3 px-3 py-1.5 border-b border-secondary/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Stars</span>
              <div className="flex items-center gap-1">
                <div className="relative h-3.5 w-3.5 shrink-0">
                  <Image src={toPublicImageUrl(RESOURCE_ICONS.goldB)} alt="Gold" fill sizes="14px" className="object-contain" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Attacker</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="relative h-3.5 w-3.5 shrink-0">
                  <Image src={toPublicImageUrl(RESOURCE_ICONS.elixirB)} alt="Elixir" fill sizes="14px" className="object-contain" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Defender</span>
              </div>
            </div>
            {league.battleResults.map((r, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 px-3 py-1.5 text-xs ${i % 2 === 0 ? "" : "bg-white/5"}`}
              >
                <span className="text-white/80">{i} ★</span>
                <span className="font-bold text-accent">{r.attackerGold.toLocaleString()}</span>
                <span className="font-bold text-accent">{r.defenderElixir.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </ModalSection>
      )}
    </div>
  );
}

export function LeagueRewardsModal({ league, onClose }: LeagueRewardsModalProps) {
  return (
    <Modal show={league !== null} onClose={onClose} size="md" dismissible>
      <ModalHeader>
        {league && (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0">
              <Image
                src={toPublicImageUrl(league.image)}
                alt={league.name}
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <div>
              <div className="text-base font-extrabold text-gray-900 leading-tight">{league.name}</div>
              <div className="text-xs text-gray-500">
                {league.type === "home" ? "Home Village League" : "Builder Base League"}
              </div>
            </div>
          </div>
        )}
      </ModalHeader>
      <ModalBody>
        {league && (
          <div className="space-y-4">
            {league.type === "home" ? (
              <HomeLeagueContent league={league} />
            ) : (
              <BuilderLeagueContent league={league} />
            )}
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
