"use client";

import { customTheme } from "@/app/theme";
import { ThemeProvider } from "flowbite-react";
import { ToastContainer } from "react-toastify";
import { AppNavbar } from "@/comps/layout/AppNavbar";
import { AppSidebar } from "@/comps/layout/sidebar/AppSidebar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider theme={customTheme}>
			<div className="flex h-screen flex-col overflow-hidden">
				<AppNavbar />
				<div className="flex flex-1 overflow-hidden">
					<AppSidebar />
					<div className="flex flex-1 flex-col overflow-hidden">
						<main className="flex-1 overflow-y-auto bg-highlight dark:bg-gray-900">
							{children}
						</main>
					</div>
				</div>
			</div>
			<ToastContainer
				closeButton={false}
				hideProgressBar
				newestOnTop
				draggable
				stacked
				className={"mt-14 lg:mt-0 lg:mr-24"}
				toastClassName={
					"shadow-md rounded-lg bg-secondary p-0"
				}
			/>
		</ThemeProvider>
	);
}
