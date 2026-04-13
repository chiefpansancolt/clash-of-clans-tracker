"use client";

import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from "flowbite-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiCog, HiHome, HiViewGrid } from "react-icons/hi";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { useUI } from "@/lib/contexts/UIContext";
import { PlaythroughSwitcher } from "./PlaythroughSwitcher";

export function AppSidebar() {
	const pathname = usePathname();
	const { activePlaythrough } = usePlaythrough();
	const { sidebarOpen, setSidebarOpen } = useUI();

	return (
		<aside
			className={`fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 transform overflow-y-auto border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:static md:top-0 md:h-auto md:translate-x-0 dark:border-gray-700 dark:bg-gray-800 ${
				sidebarOpen ? "translate-x-0" : "-translate-x-full"
			}`}
		>
			<Sidebar aria-label="Sidebar navigation" className="h-full border-none">
				<div className="flex h-full flex-col">
					<PlaythroughSwitcher />

					<div className="mt-2 flex-1 overflow-y-auto">
						<SidebarItems>
							<SidebarItemGroup>
								<SidebarItem
									as={Link}
									href="/"
									icon={HiHome}
									active={pathname === "/"}
									onClick={() => setSidebarOpen(false)}
								>
									Home
								</SidebarItem>

								<SidebarItem
									as={Link}
									href="/playthrough/list"
									icon={HiViewGrid}
									active={pathname === "/playthrough/list"}
									onClick={() => setSidebarOpen(false)}
								>
									Playthroughs
								</SidebarItem>

								{/* CHANGE_ME: Add game-specific sidebar items here */}
								{/* Example:
								{activePlaythrough && (
									<>
										<SidebarItem
											as={Link}
											href="/dashboard"
											icon={HiChartPie}
											active={pathname === "/dashboard"}
											onClick={() => setSidebarOpen(false)}
										>
											Dashboard
										</SidebarItem>
										<SidebarItem
											as={Link}
											href="/tracking"
											icon={HiClipboardList}
											active={pathname === "/tracking"}
											onClick={() => setSidebarOpen(false)}
										>
											Tracking
										</SidebarItem>
									</>
								)}
								*/}

								{/* Suppress unused variable warning during development */}
								{activePlaythrough && null}
							</SidebarItemGroup>
						</SidebarItems>
					</div>

					<div>
						<ul>
							<li>
								<Link
									href="/settings"
									onClick={() => setSidebarOpen(false)}
									className={`flex cursor-pointer items-center justify-center rounded-lg p-2 text-sm font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${pathname === "/settings" ? "bg-gray-100 dark:bg-gray-700" : ""}`}
								>
									<HiCog className="h-6 w-6 shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white" />
									<span className="flex-1 px-3 whitespace-nowrap">Settings</span>
								</Link>
							</li>
						</ul>
					</div>
				</div>
			</Sidebar>
		</aside>
	);
}
