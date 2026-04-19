import { ThemeModeScript } from "flowbite-react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PlaythroughProvider } from "@/lib/contexts/PlaythroughContext";
import { UIProvider } from "@/lib/contexts/UIContext";
import { LayoutWrapper } from "@/comps/layout/LayoutWrapper";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const siteUrl = "https://stardew-valley.gamerdex.app";

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "Clash of Clans Tracker",
		template: "%s | Clash of Clans Tracker",
	},
	description:
		"Track your Clash of Clans progress — manage upgrades, achievements, and multiple accounts in one place.",
	keywords: [
		"Clash of Clans",
		"Clash of Clans tracker",
		"Clash of Clans companion",
		"Clash of Clans progress",
	],
	authors: [{ name: "GamerDex" }],
	creator: "GamerDex",
	robots: {
		index: true,
		follow: true,
	},
	manifest: "/site.webmanifest",
	icons: {
		icon: [
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: "/apple-touch-icon.png",
		other: [
			{ rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
			{ rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
		],
	},
	openGraph: {
		type: "website",
		siteName: "Clash of Clans Tracker",
		title: "Clash of Clans Tracker",
		description:
			"Track your Clash of Clans progress — manage upgrades, achievements, and multiple accounts in one place.",
		url: siteUrl,
		images: [
			{
				url: "/Site Screenshot.png",
				width: 1200,
				alt: "Clash of Clans Tracker dashboard preview",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Clash of Clans Tracker",
		description:
			"Track your Clash of Clans progress — manage upgrades, achievements, and multiple accounts in one place.",
		images: ["/Site Screenshot.png"],
	},
};

const RootLayout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<html lang="en" suppressHydrationWarning className="h-full">
			<head>
				<ThemeModeScript />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-highlight antialiased dark:bg-gray-900`}
			>
				<UIProvider>
					<PlaythroughProvider>
						<LayoutWrapper>{children}</LayoutWrapper>
					</PlaythroughProvider>
				</UIProvider>
			</body>
		</html>
	);
}
export default RootLayout;
