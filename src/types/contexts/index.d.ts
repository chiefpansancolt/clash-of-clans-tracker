import { Playthrough } from "@/types/app";

export interface PlaythroughContextType {
  playthroughs: Playthrough[];
  activePlaythrough: Playthrough | null;
  setActivePlaythrough: (id: string | null) => void;
  addPlaythrough: (
    playthrough: Omit<Playthrough, "id" | "createdAt" | "lastModified">,
  ) => void;
  updatePlaythrough: (id: string, updates: Partial<Playthrough>) => void;
  deletePlaythrough: (id: string) => void;
  importData: (jsonString: string) => { success: boolean; error?: string };
  exportData: () => string;
  clearAllData: () => void;
}

export interface UIContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export interface SaveFABProps {
  isDirty: boolean;
  onSave: () => boolean;
}
