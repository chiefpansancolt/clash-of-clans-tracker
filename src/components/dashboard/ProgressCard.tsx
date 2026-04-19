import Link from "next/link";
import type { ProgressCardProps } from "@/types/components/dashboard";

const progressColor = (pct: number): string  => {
  if (pct >= 100) return "bg-green-500";
  if (pct >= 80)  return "bg-blue-400";
  if (pct >= 60)  return "bg-accent";
  return "bg-orange-400";
}

export const ProgressCard = ({ label, result, sub, queueHref }: ProgressCardProps) => {
  const trackColor = progressColor(result.pct);
  return (
    <div className="overflow-hidden rounded-lg border border-secondary/80">
      <div className="flex items-center bg-secondary px-3 py-2">
        <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-accent">{label}</span>
        {queueHref && (
          <Link
            href={queueHref}
            className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white/80 hover:bg-white/10 hover:text-accent transition-colors"
          >
            Queue
          </Link>
        )}
      </div>
      <div className="bg-primary p-3">
        <div className="text-2xl font-extrabold leading-none text-accent">{result.pct}%</div>
        <div className="mt-0.5 mb-2 text-[11px] text-white/80">
          {result.current.toLocaleString()} / {result.max.toLocaleString()}
          {sub && <span className="ml-1">· {sub}</span>}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all ${trackColor}`}
            style={{ width: `${result.pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
