export const BulkActions = ({ onMaxAll, onResetAll }: { onMaxAll: () => void; onResetAll: () => void }) => {
  return (
    <div className="mb-3 flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onResetAll}
        className="cursor-pointer rounded-md border border-secondary/80 px-2.5 py-1 text-[11px] font-semibold text-gray-500 transition-colors hover:bg-secondary/10 hover:text-gray-700"
      >
        Reset All
      </button>
      <button
        type="button"
        onClick={onMaxAll}
        className="cursor-pointer rounded-md border border-secondary/80 bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-gray-700 transition-colors hover:bg-secondary/20"
      >
        Max All
      </button>
    </div>
  );
}
