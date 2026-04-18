"use client";

import { useState } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import type { AdjustTimeModalProps } from "@/types/components/upgrade";

function parseRemaining(finishesAt: string) {
  const totalSec = Math.max(0, Math.floor((new Date(finishesAt).getTime() - Date.now()) / 1000));
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

export function AdjustTimeModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  nextLevel,
  currentFinishesAt,
}: AdjustTimeModalProps) {
  const parsed = parseRemaining(currentFinishesAt);
  const [days, setDays] = useState(parsed.days);
  const [hours, setHours] = useState(parsed.hours);
  const [minutes, setMinutes] = useState(parsed.minutes);
  const [seconds, setSeconds] = useState(parsed.seconds);

  function handleConfirm() {
    const durationMs = (days * 86400 + hours * 3600 + minutes * 60 + seconds) * 1000;
    onConfirm(new Date(Date.now() + durationMs).toISOString());
    onClose();
  }

  return (
    <Modal show={isOpen} onClose={onClose} size="sm">
      <ModalHeader>Adjust Time Remaining</ModalHeader>
      <ModalBody>
        <div className="mb-4 rounded-lg border border-secondary/80 bg-primary/20 p-3">
          <p className="font-bold text-gray-900 dark:text-white">
            {itemName} → Level {nextLevel}
          </p>
        </div>

        <p className="mb-3 text-sm text-gray-600 dark:text-white/80">
          Set the new time remaining:
        </p>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Days", value: days, set: setDays },
            { label: "Hours", value: hours, set: setHours, max: 23 },
            { label: "Mins", value: minutes, set: setMinutes, max: 59 },
            { label: "Secs", value: seconds, set: setSeconds, max: 59 },
          ].map(({ label, value, set, max }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-white/80">
                {label}
              </label>
              <input
                type="number"
                min={0}
                max={max}
                value={value}
                onChange={(e) => set(Math.max(0, max !== undefined ? Math.min(max, Number(e.target.value)) : Number(e.target.value)))}
                className="w-full rounded-lg border border-secondary/80 bg-white p-2 text-center text-sm font-bold text-gray-900 focus:border-accent/80 focus:ring-1 focus:ring-accent/80 dark:bg-primary/20 dark:text-white"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className="mt-4 w-full cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-accent/80"
        >
          Update Time
        </button>
      </ModalBody>
    </Modal>
  );
}
