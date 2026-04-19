"use client";

import Link from "next/link";
import { HiHome, HiTemplate } from "react-icons/hi";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";

const NotFound = () => {
	const { activePlaythrough } = usePlaythrough();

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
			<p className="text-accent text-8xl font-bold">404</p>
			<h1 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h1>
			<p className="mt-2 text-sm text-gray-500">
				That page doesn&apos;t exist or may have moved.
			</p>
			<div className="mt-8 flex gap-3">
				{activePlaythrough && (
					<Link
						href="/dashboard"
						className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
					>
						<HiTemplate className="h-4 w-4" />
						Go to Dashboard
					</Link>
				)}
				<Link
					href="/"
					className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
				>
					<HiHome className="h-4 w-4" />
					Go Home
				</Link>
			</div>
		</div>
	);
}
export default NotFound;
