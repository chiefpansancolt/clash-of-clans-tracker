"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { AppData, Playthrough } from "@/types/app";
import type { PlaythroughContextType } from "@/types/contexts";
import { storageService } from "@/service/storage";
import { createDefaultVillageData } from "@/lib/utils/villageHelpers";

const PlaythroughContext = createContext<PlaythroughContextType | undefined>(undefined);

export function PlaythroughProvider({ children }: { children: React.ReactNode }) {
	const [appData, setAppData] = useState<AppData>({ playthroughs: [], activePlaythroughId: null });
	const [isLoaded, setIsLoaded] = useState(false);
	const [loadError, setLoadError] = useState<Error | null>(null);

	// Throw during render so React propagates it to the nearest error boundary.
	// (Errors thrown in useEffect don't reach error boundaries on their own.)
	if (loadError) throw loadError;

	// Load from localStorage after mount (avoids SSR/client hydration mismatch)
	useEffect(() => {
		try {
			// Both state updates are batched into one re-render, so the save effect
			// below only fires once both appData and isLoaded reflect the loaded state.
			setAppData(storageService.load());
			setIsLoaded(true);
		} catch (err) {
			setLoadError(err instanceof Error ? err : new Error(String(err)));
		}
	}, []);

	// Auto-save to localStorage on every state change after initial load.
	// Because isLoaded and appData are set together in the same effect above,
	// this never fires with the initial empty appData — only with real data.
	useEffect(() => {
		if (!isLoaded) return;
		storageService.save(appData);
	}, [appData, isLoaded]);

	const activePlaythrough =
		appData.playthroughs.find((p) => p.id === appData.activePlaythroughId) || null;

	const setActivePlaythrough = (id: string | null) => {
		setAppData((prev) => ({ ...prev, activePlaythroughId: id }));
	};

	const addPlaythrough = (
		playthrough: Omit<Playthrough, "id" | "createdAt" | "lastModified">
	) => {
		const now = new Date().toISOString();
		const newPlaythrough: Playthrough = {
			...playthrough,
			id: crypto.randomUUID(),
			createdAt: now,
			lastModified: now,
			data: playthrough.data ?? createDefaultVillageData(),
		};

		setAppData((prev) => {
			const newPlaythroughs = [...prev.playthroughs, newPlaythrough];
			const newActiveId =
				prev.playthroughs.length === 0 ? newPlaythrough.id : prev.activePlaythroughId;

			return { playthroughs: newPlaythroughs, activePlaythroughId: newActiveId };
		});
	};

	const updatePlaythrough = (id: string, updates: Partial<Playthrough>) => {
		setAppData((prev) => ({
			...prev,
			playthroughs: prev.playthroughs.map((p) =>
				p.id === id ? { ...p, ...updates, lastModified: new Date().toISOString() } : p
			),
		}));
	};

	const deletePlaythrough = (id: string) => {
		setAppData((prev) => {
			const newPlaythroughs = prev.playthroughs.filter((p) => p.id !== id);
			const newActiveId =
				prev.activePlaythroughId === id
					? newPlaythroughs[0]?.id || null
					: prev.activePlaythroughId;

			return { playthroughs: newPlaythroughs, activePlaythroughId: newActiveId };
		});
	};

	const importData = (jsonString: string) => {
		const result = storageService.importData(jsonString);
		if (result.success) {
			const data = storageService.load();
			setAppData(data);
		}
		return result;
	};

	const exportData = () => storageService.exportData();

	const clearAllData = () => {
		setAppData({ playthroughs: [], activePlaythroughId: null });
		storageService.clear();
	};

	return (
		<PlaythroughContext.Provider
			value={{
				playthroughs: appData.playthroughs,
				activePlaythrough,
				isLoaded,
				setActivePlaythrough,
				addPlaythrough,
				updatePlaythrough,
				deletePlaythrough,
				importData,
				exportData,
				clearAllData,
			}}
		>
			{children}
		</PlaythroughContext.Provider>
	);
}

export function usePlaythrough() {
	const context = useContext(PlaythroughContext);
	if (context === undefined) {
		throw new Error("usePlaythrough must be used within a PlaythroughProvider");
	}
	return context;
}
