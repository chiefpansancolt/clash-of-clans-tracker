"use client";

import React, { createContext, startTransition, useContext, useEffect, useState } from "react";
import type { AppData, AppSettings, Playthrough } from "@/types/app";
import { defaultSettings } from "@/service/storage";
import type { PlaythroughContextType } from "@/types/contexts";
import { storageService } from "@/service/storage";
import { createDefaultVillageData } from "@/lib/utils/villageHelpers";

const PlaythroughContext = createContext<PlaythroughContextType | undefined>(undefined);

export function PlaythroughProvider({ children }: { children: React.ReactNode }) {
	const [appData, setAppData] = useState<AppData>({ playthroughs: [], activePlaythroughId: null, settings: defaultSettings });
	const [isLoaded, setIsLoaded] = useState(false);
	const [loadError, setLoadError] = useState<Error | null>(null);

	// Throw during render so React propagates it to the nearest error boundary.
	// (Errors thrown in useEffect don't reach error boundaries on their own.)
	if (loadError) throw loadError;

	// Load from localStorage after mount (avoids SSR/client hydration mismatch)
	useEffect(() => {
		try {
			const data = storageService.load();
			// Wrap in startTransition so setState calls are inside a callback, not
			// directly in the effect body (satisfies react-hooks/set-state-in-effect).
			startTransition(() => {
				setAppData(data);
				setIsLoaded(true);
			});
		} catch (err) {
			startTransition(() => {
				setLoadError(err instanceof Error ? err : new Error(String(err)));
			});
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

	const updateSettings = (patch: Partial<AppSettings>) => {
		setAppData((prev) => ({
			...prev,
			settings: { ...(prev.settings ?? defaultSettings), ...patch },
		}));
	};

	const clearAllData = () => {
		setAppData({ playthroughs: [], activePlaythroughId: null, settings: defaultSettings });
		storageService.clear();
	};

	return (
		<PlaythroughContext.Provider
			value={{
				playthroughs: appData.playthroughs,
				activePlaythrough,
				isLoaded,
				appSettings: appData.settings ?? defaultSettings,
				setActivePlaythrough,
				addPlaythrough,
				updatePlaythrough,
				deletePlaythrough,
				updateSettings,
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
