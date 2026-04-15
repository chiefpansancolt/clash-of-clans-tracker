import type { ProgressResult } from "@/lib/utils/progressHelpers";

interface ProgressCardProps {
  label: string;
  result: ProgressResult;
  sub?: string;
}

function progressColor(pct: number): string {
  if (pct >= 100) return "bg-green-500";
  if (pct >= 80)  return "bg-blue-400";
  if (pct >= 60)  return "bg-accent";
  return "bg-red-500";
}

export function ProgressCard({ label, result, sub }: ProgressCardProps) {
  const trackColor = progressColor(result.pct);
  return (
    <div className="overflow-hidden rounded-lg border border-secondary/80">
      <div className="bg-secondary px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{label}</span>
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
