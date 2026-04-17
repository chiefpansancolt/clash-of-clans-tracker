"use client";

import { useEffect, useState } from "react";

import type { SliderRowProps } from "@/types/components/massEdit";

export function SliderRow({ label, imageUrl, currentLevel, maxLevel, onChange, indent = false, disabled = false, neverLocked = false }: SliderRowProps) {
  const [inputValue, setInputValue] = useState(String(currentLevel));

  // Sync text input when slider (or external state) changes
  useEffect(() => {
    setInputValue(String(currentLevel));
  }, [currentLevel]);

  const isLocked = !neverLocked && currentLevel === 0;
  const isMaxed = maxLevel > 0 && currentLevel >= maxLevel;
  const isDisabled = maxLevel === 0 || disabled;

  function handleRange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    setInputValue(String(val));
    onChange(val);
  }

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function handleNumberBlur() {
    const parsed = parseInt(inputValue, 10);
    const clamped = isNaN(parsed) ? 0 : Math.max(0, Math.min(maxLevel, parsed));
    setInputValue(String(clamped));
    onChange(clamped);
  }

  function handleNumberKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleNumberBlur();
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
        indent
          ? "ml-6 border-l-2 border-accent/80 bg-accent/5"
          : isLocked
          ? "bg-secondary/10"
          : "bg-highlight hover:bg-secondary/10"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {/* Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={label}
          className={`h-8 w-8 shrink-0 object-contain rounded ${isLocked ? "opacity-40 grayscale" : ""}`}
        />
      ) : (
        <div
          className={`h-8 w-8 shrink-0 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary ${
            isLocked ? "opacity-40" : ""
          }`}
        >
          {label.slice(0, 2).toUpperCase()}
        </div>
      )}

      {/* Label */}
      <span
        className={`w-44 shrink-0 truncate text-sm font-medium ${
          indent ? "text-secondary" : isLocked ? "text-secondary/60" : "text-gray-900"
        }`}
      >
        {indent && <img src="/images/other/supercharge.png" alt="Supercharge" className="inline-block h-4 w-4 mr-1 object-contain" />}
        {label}
      </span>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={maxLevel}
        value={currentLevel}
        disabled={isDisabled}
        onChange={handleRange}
        className="flex-1 min-w-0 cursor-pointer accent-primary disabled:cursor-not-allowed"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={maxLevel}
        aria-valuenow={currentLevel}
      />

      {/* Number input + max */}
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="number"
          min={0}
          max={maxLevel}
          value={inputValue}
          disabled={isDisabled}
          onChange={handleNumberChange}
          onBlur={handleNumberBlur}
          onKeyDown={handleNumberKeyDown}
          className={`w-16 rounded border border-secondary/80 bg-highlight px-1 py-0.5 text-center text-sm font-semibold text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary/80`}
        />
        <span
          className={`text-xs font-medium shrink-0 ${
            isMaxed ? "text-green-600 font-bold" : "text-gray-400"
          }`}
        >
          / {maxLevel}
          {isMaxed && " ✓"}
        </span>
      </div>
    </div>
  );
}
