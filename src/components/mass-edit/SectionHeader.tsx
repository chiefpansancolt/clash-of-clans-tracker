export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-1.5 border-b border-secondary/80 pb-1 text-[11px] font-bold uppercase tracking-widest text-gray-900">
      {children}
    </h3>
  );
}
