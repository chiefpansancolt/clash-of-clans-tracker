"use client";

import { Button, Navbar, NavbarBrand } from "flowbite-react";
import { HiMenu, HiX } from "react-icons/hi";
import { useUI } from "@/lib/contexts/UIContext";
import { WaffleMenu } from "@/components/layout/WaffleMenu";

export function AppNavbar() {
	const { sidebarOpen, toggleSidebar } = useUI();

	return (
		<Navbar fluid className="border-b border-primary/80 bg-primary">
			<div className="flex w-full items-center justify-between">
				<div className="flex items-center gap-3">
					<Button
						onClick={toggleSidebar}
						size="sm"
						className="mr-4 border-white/80 bg-white/10 text-white hover:bg-white/20 md:hidden"
					>
						{sidebarOpen ? <HiX className="size-6" /> : <HiMenu className="size-6" />}
						<span className="sr-only">Toggle sidebar</span>
					</Button>
					<NavbarBrand>
						<img
							src="/clash-of-clans-icon.png"
							alt="Clash of Clans"
							width={32}
							height={32}
							className="mr-2"
						/>
						<span className="self-center text-xl font-semibold whitespace-nowrap text-white">
							Clash of Clans Tracker
						</span>
					</NavbarBrand>
				</div>
				<WaffleMenu />
			</div>
		</Navbar>
	);
}
