export function HallLevelPicker({
  label,
  level,
  maxLevel,
  onChange,
  allowZero = false,
}: {
  label: string;
  level: number;
  maxLevel: number;
  onChange: (level: number) => void;
  allowZero?: boolean;
}) {
  const levels = allowZero
    ? [0, ...Array.from({ length: maxLevel }, (_, i) => i + 1)]
    : Array.from({ length: maxLevel }, (_, i) => i + 1);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-secondary/80 bg-highlight px-3 py-2.5">
      <span className="shrink-0 text-[11px] font-bold uppercase tracking-widest text-gray-500">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {levels.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onChange(l)}
            className={`flex h-7 min-w-7 cursor-pointer items-center justify-center rounded-md px-1.5 text-xs font-bold transition-colors ${
              l === level
                ? "bg-primary text-white"
                : l === 0
                ? "bg-secondary/10 text-gray-400 hover:bg-secondary/20"
                : "bg-secondary/10 text-gray-700 hover:bg-secondary/20"
            }`}
          >
            {l === 0 ? "—" : l}
          </button>
        ))}
      </div>
    </div>
  );
}
