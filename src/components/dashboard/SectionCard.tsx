import type { SectionCardProps } from "@/types/components/dashboard";

export function SectionCard({ title, children, className = "" }: SectionCardProps) {
  return (
    <div className={`overflow-hidden rounded-lg border border-secondary/80 bg-primary ${className}`}>
      <div className="bg-secondary px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
