"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { AppData, Playthrough } from "@/types/app";
import type { PlaythroughContextType } from "@/types/contexts";
import { storageService } from "@/service/storage";

const PlaythroughContext = createContext<PlaythroughContextType | undefined>(undefined);

export function PlaythroughProvider({ children }: { children: React.ReactNode }) {
	const [appData, setAppData] = useState<AppData>(() => storageService.load());
	const isLoadedRef = useRef(false);

	// Auto-save to localStorage on every state change (skip initial mount)
	useEffect(() => {
		if (isLoadedRef.current) {
			storageService.save(appData);
		} else {
			isLoadedRef.current = true;
		}
	}, [appData]);

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
			// CHANGE_ME: Add default game-specific data here
			// e.g., data: { completedQuests: [], unlockedItems: {} }
			data: playthrough.data ?? {},
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
