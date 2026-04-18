"use client";

import { RiCloseLine } from "react-icons/ri";
import { formatFullNumber } from "@/lib/utils/upgradeHelpers";
import type { ResourceGroup } from "@/types/app/queue";

interface Props {
  groups: ResourceGroup[];
  title?: string;
  onClose: () => void;
}

function resourceClass(resource: string) {
  if (resource === "Gold") return "text-accent";
  if (resource === "Dark Elixir") return "text-blue-300";
  return "text-purple-300";
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ResourcePlannerModal({ groups, title = "Resource Planner", onClose }: Props) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto flex w-full max-w-xl flex-col rounded-2xl border border-secondary/80 bg-[#0f1e36] shadow-2xl"
          style={{ maxHeight: "80vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 border-b border-secondary/80 px-5 py-4">
            <div>
              <p className="text-[15px] font-extrabold text-white">{title}</p>
              <p className="text-[11px] text-white/80">Upcoming resource requirements</p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/8 text-white hover:bg-white/15 transition-colors"
            >
              <RiCloseLine size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {groups.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-white/80">
                No upcoming resource events. Add items to a queue to see the plan.
              </p>
            ) : (
              groups.map((group, gi) => {
                const isGrouped = group.events.length > 1;

                // Compute per-resource totals for grouped cards
                const totals = group.events.reduce<Record<string, number>>((acc, ev) => {
                  acc[ev.costResource] = (acc[ev.costResource] ?? 0) + ev.cost;
                  return acc;
                }, {});

                return (
                  <div key={gi} className="flex flex-col gap-1.5">
                    {/* Day header */}
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-accent/30 bg-primary/80 px-3 py-0.5 text-[11px] font-extrabold text-white whitespace-nowrap">
                        {group.dayOffset === 0 ? "Today" : `Day ${group.dayOffset}`}
                      </span>
                      <span className="text-[11px] text-white/80">{formatDate(group.date)}</span>
                      {isGrouped && (
                        <span className="ml-auto rounded-full border border-red-500/40 bg-red-900/15 px-2 py-0.5 text-[10px] font-bold text-red-300">
                          ⚡ {group.events.length} within 1 hour
                        </span>
                      )}
                    </div>

                    {/* Card */}
                    <div
                      className={`overflow-hidden rounded-xl border ${
                        isGrouped ? "border-red-600/40 bg-primary/35" : "border-secondary/80 bg-primary/30"
                      }`}
                    >
                      {group.events.map((ev, ei) => (
                        <div
                          key={ei}
                          className="flex items-center gap-3 px-4 py-2.5 border-b border-secondary/25 last:border-b-0"
                        >
                          {/* Builder tag */}
                          <span className="shrink-0 rounded bg-white/8 px-2 py-0.5 text-[10px] font-bold text-white/80 whitespace-nowrap">
                            {ev.builderLabel}
                          </span>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-white/80 mb-0.5">
                              Finishes{" "}
                              <span className="font-bold text-white">{ev.completingItem}</span>
                              {" "}at {formatTime(ev.completesAt)}
                            </p>
                            <p className="text-[12px] font-bold text-white truncate">
                              ⟶ {ev.nextItem}
                            </p>
                          </div>

                          {/* Cost */}
                          <div className="shrink-0 text-right">
                            <p className={`text-[13px] font-extrabold ${resourceClass(ev.costResource)}`}>
                              {formatFullNumber(ev.cost)}
                            </p>
                            <p className="text-[9px] font-bold uppercase tracking-wide text-white/80">
                              {ev.costResource}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Totals footer — only for grouped cards */}
                      {isGrouped && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-secondary/25 bg-black/20 px-4 py-2">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-white/80 mr-1">
                            Total needed
                          </span>
                          {Object.entries(totals).map(([resource, amount]) => (
                            <span
                              key={resource}
                              className={`rounded-md bg-white/6 px-2 py-1 text-[11px] font-bold ${resourceClass(resource)}`}
                            >
                              {formatFullNumber(amount)} {resource}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
