"use client";

import { useMemo, useState } from "react";
import { RiArrowRightLine, RiTimeLine, RiEditLine, RiCheckLine, RiCloseLine } from "react-icons/ri";
import { LabelWithArrow } from "@/components/common/LabelWithArrow";
import { formatBuildTime } from "@/lib/utils/upgradeHelpers";
import {
  localTimeToUtcMinutes,
  utcMinutesToLocalTimeStr,
  formatActiveHoursDisplay,
} from "@/lib/utils/activeHoursHelpers";
import type { TimelineBlock } from "@/types/app/queue";
import type { ActiveHours } from "@/types/app/playthrough";
import type { QueueTimelineProps, HoveredBlock } from "@/types/components/queue";

const ZOOM_OPTIONS = [
  { label: "1d", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const;

const formatTime = (date: Date) => {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const BlockTooltip = ({ block }: { block: TimelineBlock }) => {
  const durationMs = block.endsAt.getTime() - block.startsAt.getTime();
  const totalMinutes = Math.floor(durationMs / 60_000);
  const duration = formatBuildTime({
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  });

  return (
    <div className="w-44 rounded-lg border border-secondary/80 bg-[#0f1e36] p-2.5 shadow-xl pointer-events-none">
      <p className="text-[11px] font-bold text-white leading-tight mb-1"><LabelWithArrow label={block.label} /></p>
      {block.isIdle ? (
        <p className="text-[10px] text-white/80">Builder free</p>
      ) : (
        <>
          <p className="text-[10px] text-white/80">{formatTime(block.startsAt)}</p>
          <p className="text-[10px] text-white/80 flex items-center gap-0.5"><RiArrowRightLine size={10} /> {formatTime(block.endsAt)}</p>
          <p className="mt-1 text-[10px] font-bold text-accent">{duration}</p>
        </>
      )}
    </div>
  );
}

const ActiveHoursFooter = ({ activeHours, onActiveHoursChange }: {
  activeHours?: ActiveHours;
  onActiveHoursChange: (hours: ActiveHours | undefined) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [startStr, setStartStr] = useState(() =>
    activeHours ? utcMinutesToLocalTimeStr(activeHours.startUtcMinutes) : "07:00"
  );
  const [endStr, setEndStr] = useState(() =>
    activeHours ? utcMinutesToLocalTimeStr(activeHours.endUtcMinutes) : "23:00"
  );

  const handleSave = () => {
    onActiveHoursChange({
      startUtcMinutes: localTimeToUtcMinutes(startStr),
      endUtcMinutes: localTimeToUtcMinutes(endStr),
    });
    setEditing(false);
  };

  const handleClear = () => {
    onActiveHoursChange(undefined);
    setEditing(false);
  };

  const handleCancel = () => {
    if (activeHours) {
      setStartStr(utcMinutesToLocalTimeStr(activeHours.startUtcMinutes));
      setEndStr(utcMinutesToLocalTimeStr(activeHours.endUtcMinutes));
    }
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2 border-t border-secondary/80 px-1 pt-2 mt-2">
      <RiTimeLine size={11} className="shrink-0 text-white/80" />
      {editing ? (
        <>
          <span className="text-[10px] text-white/80">Active</span>
          <input
            type="time"
            value={startStr}
            onChange={(e) => setStartStr(e.target.value)}
            className="rounded border border-secondary/80 bg-white/8 px-1.5 py-0.5 text-[10px] text-white scheme-dark"
          />
          <span className="text-[10px] text-white/80">–</span>
          <input
            type="time"
            value={endStr}
            onChange={(e) => setEndStr(e.target.value)}
            className="rounded border border-secondary/80 bg-white/8 px-1.5 py-0.5 text-[10px] text-white scheme-dark"
          />
          <button onClick={handleSave} className="cursor-pointer rounded p-1 text-green-400 hover:bg-white/10 transition-colors" title="Save">
            <RiCheckLine size={12} />
          </button>
          <button onClick={handleCancel} className="cursor-pointer rounded p-1 text-white/80 hover:bg-white/10 transition-colors" title="Cancel">
            <RiCloseLine size={12} />
          </button>
          {activeHours && (
            <button onClick={handleClear} className="cursor-pointer ml-1 text-[10px] text-red-400 hover:underline" title="Clear active hours">
              Clear
            </button>
          )}
        </>
      ) : (
        <>
          {activeHours ? (
            <span className="text-[10px] text-white/80">
              Active{" "}
              <span className="font-bold text-white">
                {formatActiveHoursDisplay(activeHours.startUtcMinutes)}
              </span>
              {" – "}
              <span className="font-bold text-white">
                {formatActiveHoursDisplay(activeHours.endUtcMinutes)}
              </span>
            </span>
          ) : (
            <span className="text-[10px] text-white/80">No active hours set — queue assumes 24/7 availability</span>
          )}
          <button
            onClick={() => setEditing(true)}
            className="cursor-pointer rounded p-1 text-white/80 hover:bg-white/10 transition-colors ml-1"
            title="Set active hours"
          >
            <RiEditLine size={11} />
          </button>
        </>
      )}
    </div>
  );
}

export const QueueTimeline = ({ timeline, slots, conflictItemIds, activeHours, onActiveHoursChange }: QueueTimelineProps) => {
  const [windowDays, setWindowDays] = useState(1);
  const [hovered, setHovered] = useState<HoveredBlock | null>(null);

  const now = useMemo(() => new Date(), []);
  const windowMs = windowDays * 86400_000;
  const windowStart = now.getTime();
  const windowEnd = windowStart + windowMs;

  const timeMarkers = useMemo(() => {
    const markers: { pct: number; label: string }[] = [];

    if (windowDays <= 1) {
      for (let h = 6; h < 24; h += 6) {
        const t = windowStart + h * 3600_000;
        if (t >= windowEnd) break;
        markers.push({ pct: ((t - windowStart) / windowMs) * 100, label: `${h}h` });
      }
    } else if (windowDays <= 7) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 1);
      while (d.getTime() < windowEnd) {
        markers.push({
          pct: ((d.getTime() - windowStart) / windowMs) * 100,
          label: d.toLocaleString("en-US", { weekday: "short" }),
        });
        d.setDate(d.getDate() + 1);
      }
    } else if (windowDays <= 30) {
      for (let w = 1; w <= 4; w++) {
        const t = windowStart + w * 7 * 86400_000;
        if (t >= windowEnd) break;
        markers.push({ pct: ((t - windowStart) / windowMs) * 100, label: `${w}w` });
      }
    } else {
      const d = new Date(now);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      d.setMonth(d.getMonth() + 1);
      while (d.getTime() < windowEnd) {
        markers.push({
          pct: ((d.getTime() - windowStart) / windowMs) * 100,
          label: d.toLocaleString("en-US", { month: "short" }),
        });
        d.setMonth(d.getMonth() + 1);
      }
    }

    return markers;
  }, [now, windowDays, windowStart, windowEnd, windowMs]);

  const toLeftPct = (date: Date) => {
    return Math.max(0, Math.min(100, ((date.getTime() - windowStart) / windowMs) * 100));
  }
  const toWidthPct = (start: Date, end: Date) => {
    const l = toLeftPct(start);
    const r = Math.max(0, Math.min(100, ((end.getTime() - windowStart) / windowMs) * 100));
    return Math.max(0, r - l);
  }

  if (slots.length === 0) return null;

  return (
    <div className="shrink-0 border-b border-secondary/80 bg-primary px-4 py-3">
      <div className="mb-2 flex items-center gap-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Timeline</p>
        <div className="flex items-center gap-1 ml-auto">
          {ZOOM_OPTIONS.map((z) => (
            <button
              key={z.label}
              onClick={() => setWindowDays(z.days)}
              className={`cursor-pointer rounded px-2 py-0.5 text-[10px] font-bold transition-colors ${
                windowDays === z.days
                  ? "bg-accent text-primary"
                  : "bg-white/8 text-white/80 hover:bg-white/15"
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: 700 }} className="relative">
          <div className="relative mb-1 h-4 pl-22.5">
            {timeMarkers.map((m) => (
              <span
                key={m.label + m.pct}
                className="absolute text-[9px] font-semibold text-white/80"
                style={{ left: `calc(90px + ${m.pct}%)`, transform: "translateX(-50%)" }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-0.75">
            {slots.map((slot) => {
              const blocks = timeline[String(slot.id)] ?? [];
              return (
                <div key={slot.id} className="flex h-7 items-center">
                  <span className="w-22.5 shrink-0 pr-2 text-right text-[10px] font-bold text-white/80">
                    {slot.label.replace("Builder ", "B")}
                  </span>
                  <div className="relative flex-1 h-full rounded bg-white/4 overflow-hidden">
                    {timeMarkers.map((m) => (
                      <div
                        key={m.pct}
                        className="absolute top-0 bottom-0 w-px bg-white/10 z-5 pointer-events-none"
                        style={{ left: `${m.pct}%` }}
                      />
                    ))}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-accent/80 z-10 pointer-events-none" style={{ left: "0%" }} />

                    {blocks.map((block, bi) => {
                      const left = toLeftPct(block.startsAt);
                      const width = toWidthPct(block.startsAt, block.endsAt);
                      if (width < 0.05) return null;

                      if (block.isIdle) {
                        return (
                          <div
                            key={bi}
                            className="absolute top-0.75 bottom-0.75 rounded-sm cursor-default"
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              background: "repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 6px)",
                              border: "1px dashed rgba(255,255,255,0.08)",
                            }}
                            onMouseEnter={(e) => setHovered({ block, x: e.clientX, y: e.clientY })}
                            onMouseMove={(e) => setHovered((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                            onMouseLeave={() => setHovered(null)}
                          />
                        );
                      }

                      const isConflict = !block.isActive && !block.isIdle && conflictItemIds?.size;
                      const errorStyle = isConflict
                        ? { background: "rgba(192,57,43,0.35)", border: "1px dashed rgba(248,113,113,0.7)" }
                        : undefined;

                      return (
                        <div
                          key={bi}
                          className={`absolute top-0.75 bottom-0.75 rounded-sm flex items-center overflow-hidden cursor-default ${
                            block.isActive ? "bg-accent/90" : "bg-primary border border-accent/20"
                          }`}
                          style={{ left: `${left}%`, width: `${width}%`, ...(errorStyle ?? {}) }}
                          onMouseEnter={(e) => setHovered({ block, x: e.clientX, y: e.clientY })}
                          onMouseMove={(e) => setHovered((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                          onMouseLeave={() => setHovered(null)}
                        >
                          <span className={`px-1 text-[9px] font-bold whitespace-nowrap overflow-hidden text-ellipsis ${
                            block.isActive ? "text-primary" : isConflict ? "text-red-300" : "text-white"
                          }`}>
                            {block.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <ActiveHoursFooter activeHours={activeHours} onActiveHoursChange={onActiveHoursChange} />
        </div>
      </div>

      {hovered && (
        <div
          className="fixed z-9999"
          style={{
            left: hovered.x + 12,
            top: hovered.y - 10,
            transform: hovered.x > window.innerWidth - 200 ? "translateX(calc(-100% - 24px))" : undefined,
          }}
        >
          <BlockTooltip block={hovered.block} />
        </div>
      )}
    </div>
  );
}
