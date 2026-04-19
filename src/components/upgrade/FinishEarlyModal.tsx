"use client";

import Image from "next/image";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { FiClock, FiBook, FiTool } from "react-icons/fi";
import { RiArrowRightLine } from "react-icons/ri";
import type { FinishEarlyModalProps, FinishMethod } from "@/types/components/upgrade";

const FINISH_OPTIONS: {
  method: FinishMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    method: "none",
    label: "Time Passed",
    description: "Finished naturally",
    icon: <FiClock className="h-5 w-5" />,
  },
  {
    method: "gems",
    label: "Gems",
    description: "Sped up with gems",
    icon: (
      <span className="relative inline-block h-5 w-5 shrink-0">
        <Image src="/images/other/gem.png" alt="Gems" fill className="object-contain" sizes="20px" />
      </span>
    ),
  },
  {
    method: "book",
    label: "Book",
    description: "Used a Book",
    icon: <FiBook className="h-5 w-5" />,
  },
  {
    method: "hammer",
    label: "Hammer",
    description: "Used a Hammer",
    icon: <FiTool className="h-5 w-5" />,
  },
];

export const FinishEarlyModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  nextLevel,
  timeRemaining,
}: FinishEarlyModalProps) => {
  return (
    <Modal show={isOpen} onClose={onClose} size="md">
      <ModalHeader>Finish Upgrade Early</ModalHeader>
      <ModalBody>
        <div className="mb-4 rounded-lg border border-secondary/80 bg-primary/20 p-3">
          <p className="font-bold text-gray-900 dark:text-white">
            {itemName} <RiArrowRightLine size={14} className="inline mx-0.5" /> Level {nextLevel}
          </p>
          <p className="text-sm text-gray-600 dark:text-white/80">
            {timeRemaining} remaining
          </p>
        </div>

        <p className="mb-3 text-sm text-gray-600 dark:text-white/80">
          How was this upgrade finished?
        </p>

        <div className="grid grid-cols-2 gap-2">
          {FINISH_OPTIONS.map(({ method, label, description, icon }) => (
            <button
              key={method}
              type="button"
              onClick={() => {
                onConfirm(method);
                onClose();
              }}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-accent/80 bg-accent/10 p-3 text-left transition-colors hover:bg-accent/20"
            >
              <span className="shrink-0 text-secondary dark:text-accent">{icon}</span>
              <span>
                <p className="text-sm font-bold text-secondary dark:text-accent">{label}</p>
                <p className="text-xs text-gray-600 dark:text-white/80">{description}</p>
              </span>
            </button>
          ))}
        </div>
      </ModalBody>
    </Modal>
  );
}
