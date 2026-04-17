import Image from "next/image";
import { clan as clanData } from "clash-of-clans-data";
import { toPublicImageUrl } from "@/lib/utils/imageHelpers";
import type { PlayerHeaderProps } from "@/types/components/dashboard";

const _clan = clanData();

function getClanBannerUrl(clanLevel: number): string {
  const level = _clan.levels().atLevel(clanLevel) as { image?: string } | undefined;
  return toPublicImageUrl(level?.image ?? "");
}

export function PlayerHeader({ playthrough, achievementsProgress }: PlayerHeaderProps) {
  const { data } = playthrough;
  const hv = data.homeVillage;
  const thLevel = hv.townHallLevel;
  const thImageUrl = toPublicImageUrl(`images/home/town-hall/normal/level-${thLevel}.png`);

  const RADIUS = 28;
  const CIRC = 2 * Math.PI * RADIUS;
  const filled = (achievementsProgress.pct / 100) * CIRC;

  return (
    <div className="mb-5 flex items-center gap-4 rounded-xl border border-secondary/80 bg-linear-to-br from-primary to-[#0f2547] p-4">
      <div className="relative shrink-0">
        <div className="relative h-16 w-16">
          <Image
            src={thImageUrl}
            alt={`TH${thLevel}`}
            fill
            sizes="64px"
            className="object-contain"
          />
        </div>
        <span className="absolute -bottom-1 -right-1 rounded px-1 text-[11px] font-extrabold bg-accent text-primary leading-none py-0.5">
          TH{thLevel}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xl font-extrabold text-white leading-tight truncate">
          {playthrough.name}
        </div>
        <div className="text-xs font-semibold text-accent mt-0.5">{data.playerTag}</div>

        <div className="mt-2 flex flex-wrap gap-2">
          {data.expLevel > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs">
              <span className="relative h-4 w-4 shrink-0">
                <Image src={toPublicImageUrl("images/other/xp.png")} alt="XP" fill sizes="16px" className="object-contain" />
              </span>
              <span className="font-bold text-accent">{data.expLevel}</span>
              <span className="text-white/80">Level</span>
            </span>
          )}
          {data.warStars > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs">
              <span className="relative h-4 w-4 shrink-0">
                <Image src={toPublicImageUrl("images/clan/labels/clan-wars.png")} alt="War Stars" fill sizes="16px" className="object-contain" />
              </span>
              <span className="font-bold text-accent">{data.warStars.toLocaleString()}</span>
              <span className="text-white/80">War Stars</span>
            </span>
          )}
          {hv.bestTrophies > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs">
              <span className="relative h-4 w-4 shrink-0">
                <Image src={toPublicImageUrl("images/other/trophy.png")} alt="Trophies" fill sizes="16px" className="object-contain" />
              </span>
              <span className="font-bold text-accent">{hv.bestTrophies.toLocaleString()}</span>
              <span className="text-white/80">Best</span>
            </span>
          )}
          {data.clanCapital.clanCapitalContributions > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs">
              <span className="relative h-4 w-4 shrink-0">
                <Image src={toPublicImageUrl("images/other/gold-c.png")} alt="Capital Gold" fill sizes="16px" className="object-contain" />
              </span>
              <span className="font-bold text-accent">{data.clanCapital.clanCapitalContributions.toLocaleString()}</span>
              <span className="text-white/80">Contributions</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        {data.clan && data.clan.clanLevel > 0 && (
          <div className="flex flex-col items-center gap-0.5">
            <div className="relative h-14 w-14">
              <Image
                src={getClanBannerUrl(data.clan.clanLevel)}
                alt={`Clan Lv${data.clan.clanLevel}`}
                fill
                sizes="56px"
                className="object-contain"
              />
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded px-1 text-[10px] font-extrabold bg-accent text-primary leading-none py-0.5">
                {data.clan.clanLevel}
              </span>
            </div>
            <span className="text-[10px] font-bold text-white/80 text-center leading-tight max-w-20">
              {data.clan.name}
            </span>
            {data.clan.role && (
              <span className="text-[9px] text-white/80 capitalize">{data.clan.role}</span>
            )}
          </div>
        )}

        {achievementsProgress.max > 0 && (
          <div className="flex flex-col items-center gap-1">
            <div className="relative h-18 w-18">
              <svg width="72" height="72" viewBox="0 0 72 72" className="block">
                <circle cx="36" cy="36" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="7" />
                <circle
                  cx="36" cy="36" r={RADIUS}
                  fill="none"
                  stroke="#f0b429"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${filled} ${CIRC}`}
                  transform="rotate(-90 36 36)"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[15px] font-extrabold text-accent">
                {achievementsProgress.pct}%
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
              Achievements
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
