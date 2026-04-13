"use client";

import { Button, DarkThemeToggle, Navbar, NavbarBrand } from "flowbite-react";
import { HiMenu, HiX } from "react-icons/hi";
import { useUI } from "@/lib/contexts/UIContext";

export function AppNavbar() {
	const { sidebarOpen, toggleSidebar } = useUI();

	return (
		<Navbar fluid className="border-b border-gray-200 dark:border-gray-700">
			<div className="flex items-center gap-3">
				<Button onClick={toggleSidebar} size="sm" className="mr-4 md:hidden">
					{sidebarOpen ? <HiX className="size-6" /> : <HiMenu className="size-6" />}
					<span className="sr-only">Toggle sidebar</span>
				</Button>
				<NavbarBrand>
					{/* CHANGE_ME: Replace with your app logo and name */}
					<span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
						YOUR_APP_NAME
					</span>
				</NavbarBrand>
			</div>
			<div className="flex md:order-2">
				<DarkThemeToggle />
			</div>
		</Navbar>
	);
}
