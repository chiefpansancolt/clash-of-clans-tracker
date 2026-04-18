"use client";

import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { formatBuildTime, formatCost, formatTimeRemaining } from "@/lib/utils/upgradeHelpers";
import type { BuilderPickerModalProps } from "@/types/components/upgrade";

export function BuilderPickerModal({
  isOpen,
  onClose,
  onConfirm,
  slots,
  itemName,
  nextLevel,
  step,
}: BuilderPickerModalProps) {
  const hasAvailable = slots.some((s) => !s.busy);

  return (
    <Modal show={isOpen} onClose={onClose} size="md" dismissible>
      <ModalHeader>Start Upgrade</ModalHeader>
      <ModalBody>
        <div className="mb-4 rounded-lg border border-secondary/80 bg-primary/20 p-3">
          <p className="font-bold text-gray-900 dark:text-white">
            {itemName} → Level {nextLevel}
          </p>
          <p className="text-sm text-gray-600 dark:text-white/80">
            {formatCost(step.cost)} {step.costResource} · {formatBuildTime(step.buildTime)}
          </p>
        </div>

        {!hasAvailable && (
          <p className="mb-3 text-sm font-medium text-action">
            All builders are currently busy.
          </p>
        )}

        <p className="mb-3 text-sm text-gray-600 dark:text-white/80">
          Select an available builder:
        </p>

        <div className="grid grid-cols-2 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              disabled={slot.busy}
              onClick={() => {
                onConfirm(slot.id);
                onClose();
              }}
              className={`rounded-lg border p-3 text-left transition-colors ${
                slot.busy
                  ? "cursor-not-allowed border-gray-200 bg-gray-100 opacity-60 dark:border-secondary/80 dark:bg-secondary/10"
                  : "cursor-pointer border-accent/80 bg-accent/10 hover:bg-accent/20"
              }`}
            >
              <p
                className={`text-sm font-bold ${
                  slot.busy ? "text-gray-400 dark:text-white/80" : "text-secondary dark:text-accent"
                }`}
              >
                {slot.label}
              </p>
              {slot.busy ? (
                <p className="text-xs text-gray-400 dark:text-white/80">
                  {slot.finishesAt ? `Done in ${formatTimeRemaining(slot.finishesAt)}` : "Busy"}
                </p>
              ) : (
                <p className="text-xs text-green-600 dark:text-green-400">Available</p>
              )}
            </button>
          ))}
        </div>
      </ModalBody>
    </Modal>
  );
}
