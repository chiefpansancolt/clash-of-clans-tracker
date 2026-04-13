"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { UIContextType } from "@/types/contexts";

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(true);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				setSidebarOpen(false);
			} else {
				setSidebarOpen(true);
			}
		};

		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const toggleSidebar = () => {
		setSidebarOpen((prev) => !prev);
	};

	return (
		<UIContext.Provider value={{ sidebarOpen, toggleSidebar, setSidebarOpen }}>
			{children}
		</UIContext.Provider>
	);
}

export function useUI() {
	const context = useContext(UIContext);
	if (context === undefined) {
		throw new Error("useUI must be used within a UIProvider");
	}
	return context;
}
