import Link from "next/link";
import type { SectionCardProps } from "@/types/components/dashboard";

export function SectionCard({ title, children, className = "", queueHref }: SectionCardProps) {
  return (
    <div className={`overflow-hidden rounded-lg border border-secondary/80 bg-primary ${className}`}>
      <div className="flex items-center bg-secondary px-3 py-2">
        <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-accent">{title}</span>
        {queueHref && (
          <Link
            href={queueHref}
            className="rounded px-2 py-0.5 text-[10px] font-bold text-white/80 hover:bg-white/10 hover:text-accent transition-colors"
          >
            Queue
          </Link>
        )}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
