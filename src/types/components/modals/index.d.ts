import { Playthrough } from "@/types/app";

export interface CreatePlaythroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface EditPlaythroughModalProps {
  isOpen: boolean;
  currentPlaythrough: Playthrough;
  onClose: () => void;
}

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
}
