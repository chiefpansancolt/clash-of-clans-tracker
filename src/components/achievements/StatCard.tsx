import type { StatCardProps } from "@/types/components/achievements";

export const StatCard = ({ label, value, sub }: StatCardProps) => (
  <div className="overflow-hidden rounded-lg border border-secondary/80">
    <div className="bg-secondary px-3 py-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{label}</span>
    </div>
    <div className="bg-primary p-3">
      <div className="text-2xl font-extrabold leading-none text-accent">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-white/80">{sub}</div>}
    </div>
  </div>
);
