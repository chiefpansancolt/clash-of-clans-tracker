"use client";

import { Alert, Badge, Button, Card, FileInput, Label } from "flowbite-react";
import { useRef, useState } from "react";
import {
	HiCheckCircle,
	HiDownload,
	HiExclamationCircle,
	HiInformationCircle,
	HiTrash,
	HiUpload,
} from "react-icons/hi";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";

export default function Settings() {
	const { playthroughs, exportData, importData, clearAllData } = usePlaythrough();

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [confirmReset, setConfirmReset] = useState(false);
	const [resetSuccess, setResetSuccess] = useState(false);
	const [importStatus, setImportStatus] = useState<{
		show: boolean;
		success: boolean;
		message: string;
	} | null>(null);

	const handleExportData = () => {
		const data = exportData();
		const blob = new Blob([data], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		// CHANGE_ME: Update the filename prefix to match your app name
		link.download = `tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const handleImportData = () => {
		if (!fileInputRef.current?.files?.length) return;

		const file = fileInputRef.current.files[0];
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				const result = importData(content);

				setImportStatus({
					show: true,
					success: result.success,
					message: result.success
						? "Data imported successfully!"
						: `Import failed: ${result.error}`,
				});

				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}

				if (result.success) {
					setTimeout(() => setImportStatus(null), 5000);
				}
			} catch (error) {
				setImportStatus({
					show: true,
					success: false,
					message: `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				});
			}
		};

		reader.readAsText(file);
	};

	const handleResetData = () => {
		if (!confirmReset) {
			setConfirmReset(true);
			return;
		}

		clearAllData();
		setResetSuccess(true);
		setConfirmReset(false);
		setTimeout(() => setResetSuccess(false), 3000);
	};

	return (
		<section className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
			<div className="mx-auto">
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white">Settings</h1>
					<p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
						Manage your data and application settings
					</p>
				</div>

				<div className="mb-8">
					<Alert color="info" icon={HiInformationCircle}>
						<div className="mb-1 text-lg font-medium">Local Storage</div>
						<p className="mb-1">
							Your data is stored locally in the browser. Data is lost when the
							browser cache is cleared.
						</p>
						<p>Use the functions below to export and backup your data regularly.</p>
					</Alert>
				</div>

				{importStatus?.show && (
					<Alert
						color={importStatus.success ? "success" : "failure"}
						icon={importStatus.success ? HiCheckCircle : HiExclamationCircle}
						onDismiss={() => setImportStatus(null)}
						className="mb-6"
					>
						{importStatus.message}
					</Alert>
				)}

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Card>
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-xl font-bold text-gray-900 dark:text-white">
								Data Management
							</h2>
							<Badge color="info">
								{playthroughs.length}{" "}
								{playthroughs.length === 1 ? "Playthrough" : "Playthroughs"}
							</Badge>
						</div>

						<div className="space-y-6">
							{/* Export */}
							<div>
								<div className="mb-2">
									<Label>Export Data</Label>
								</div>
								<Button onClick={handleExportData} className="w-full">
									<HiDownload className="mr-2 h-5 w-5" />
									Export All Playthroughs
								</Button>
								<p className="mt-1 text-sm text-gray-500">
									Download a backup file of all your saved playthroughs.
								</p>
							</div>

							{/* Import */}
							<div>
								<div className="mb-2">
									<Label>Import Data</Label>
								</div>
								<div className="flex flex-col gap-2">
									<FileInput ref={fileInputRef} accept=".json" />
									<p className="text-sm text-gray-500">
										Upload a previously exported file (.json)
									</p>
									<Button color="purple" onClick={handleImportData}>
										<HiUpload className="mr-2 h-5 w-5" />
										Import Data
									</Button>
								</div>
							</div>

							{/* Reset */}
							<div>
								<div className="mb-2">
									<Label className="text-red-500">Reset All Data</Label>
									{resetSuccess && (
										<span className="ml-2 text-sm text-green-500">
											Data reset successfully
										</span>
									)}
								</div>
								<Button color="red" onClick={handleResetData} className="w-full">
									<HiTrash className="mr-2 h-5 w-5" />
									{confirmReset ? "Confirm Reset" : "Reset All Data"}
								</Button>
								<p className="mt-1 text-sm text-red-500">
									Warning: This will delete all playthroughs and cannot be undone.
								</p>
							</div>
						</div>
					</Card>

					<Card>
						{/* CHANGE_ME: Update the About section with your app's details */}
						<h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
							About
						</h2>
						<div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
							<p>
								<strong className="text-gray-900 dark:text-white">
									YOUR_APP_NAME
								</strong>
							</p>
							<p>
								A progress tracking tool for YOUR_GAME. All data is stored locally
								in your browser.
							</p>
						</div>
					</Card>
				</div>
			</div>
		</section>
	);
}
