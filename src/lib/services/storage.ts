import type { AppData, Playthrough } from "@/types/app";

// CHANGE_ME: Rename this to match your app's slug (e.g., "my-game-tracker")
const STORAGE_KEY = "tracker-template";

const defaultData: AppData = {
  playthroughs: [],
  activePlaythroughId: null,
};

export const storageService = {
  /**
   * Load data from localStorage
   */
  load(): AppData {
    if (typeof window === "undefined") return defaultData;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return defaultData;

      return JSON.parse(stored) as AppData;
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      return defaultData;
    }
  },

  /**
   * Save data to localStorage
   */
  save(data: AppData): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
    }
  },

  /**
   * Export data as a formatted JSON string
   */
  exportData(): string {
    const data = this.load();
    return JSON.stringify(data, null, 2);
  },

  /**
   * Import data from a JSON string, replacing all existing data
   */
  importData(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString) as AppData;

      if (!data.playthroughs || !Array.isArray(data.playthroughs)) {
        return {
          success: false,
          error: "Invalid data format: missing playthroughs array",
        };
      }

      this.save(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  /**
   * Remove all data from localStorage
   */
  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Add a new playthrough (direct localStorage write, bypasses Context)
   */
  addPlaythrough(playthrough: Playthrough): void {
    const data = this.load();
    data.playthroughs.push(playthrough);

    if (data.playthroughs.length === 1) {
      data.activePlaythroughId = playthrough.id;
    }

    this.save(data);
  },

  /**
   * Update an existing playthrough (direct localStorage write, bypasses Context)
   */
  updatePlaythrough(id: string, updates: Partial<Playthrough>): void {
    const data = this.load();
    const index = data.playthroughs.findIndex((p) => p.id === id);

    if (index !== -1) {
      data.playthroughs[index] = {
        ...data.playthroughs[index],
        ...updates,
        lastModified: new Date().toISOString(),
      };
      this.save(data);
    }
  },

  /**
   * Delete a playthrough (direct localStorage write, bypasses Context)
   */
  deletePlaythrough(id: string): void {
    const data = this.load();
    data.playthroughs = data.playthroughs.filter((p) => p.id !== id);

    if (data.activePlaythroughId === id) {
      data.activePlaythroughId = data.playthroughs[0]?.id || null;
    }

    this.save(data);
  },

  /**
   * Set the active playthrough (direct localStorage write, bypasses Context)
   */
  setActivePlaythrough(id: string | null): void {
    const data = this.load();
    data.activePlaythroughId = id;
    this.save(data);
  },
};
