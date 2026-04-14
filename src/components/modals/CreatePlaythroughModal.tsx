"use client";

import {
	Alert,
	Button,
	FileInput,
	Label,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Select,
	Spinner,
	Textarea,
	TextInput,
} from "flowbite-react";
import { useRef, useState } from "react";
import {
	HiCloudDownload,
	HiExclamationCircle,
	HiInformationCircle,
	HiSparkles,
} from "react-icons/hi";
import { fetchPlayerByTag } from "@/app/actions/fetchPlayer";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { isExportDataFormat, mapExportDataToVillageData } from "@/lib/utils/exportDataMapper";
import { mapPlayerApiToVillageData, mergeWithBuildingData } from "@/lib/utils/playerApiMapper";
import { createDefaultVillageData } from "@/lib/utils/villageHelpers";
import type { CreatePlaythroughModalProps } from "@/types/components";
import type { PlayerApiResponse } from "@/types/app";
import type { VillageData } from "@/types/app/game";

type CreationMode = "fresh" | "import";

const TH_LEVELS = Array.from({ length: 18 }, (_, i) => i + 1);
const BH_LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);

export function CreatePlaythroughModal({ isOpen, onClose }: CreatePlaythroughModalProps) {
	const { addPlaythrough } = usePlaythrough();

	// Shared
	const [mode, setMode] = useState<CreationMode>("fresh");
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	// Fresh start
	const [townHallLevel, setTownHallLevel] = useState(1);
	const [builderHallLevel, setBuilderHallLevel] = useState(1);

	// Import — API
	const [playerTag, setPlayerTag] = useState("");
	const [fetching, setFetching] = useState(false);
	const [fetchError, setFetchError] = useState("");
	const [fetchedPlayer, setFetchedPlayer] = useState<PlayerApiResponse | null>(null);
	const [apiData, setApiData] = useState<VillageData | null>(null);

	// Import — building JSON supplement
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [jsonError, setJsonError] = useState("");
	const [buildingData, setBuildingData] = useState<VillageData | null>(null);
	const [buildingFileName, setBuildingFileName] = useState("");

	const canCreate =
		name.trim().length > 0 &&
		(mode === "fresh" || apiData !== null);

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleFetchPlayer = async () => {
		if (!playerTag.trim()) return;
		setFetching(true);
		setFetchError("");
		setFetchedPlayer(null);
		setApiData(null);

		const result = await fetchPlayerByTag(playerTag);
		setFetching(false);

		if (!result.success) {
			setFetchError(result.error);
			return;
		}

		setFetchedPlayer(result.player);
		setApiData(mapPlayerApiToVillageData(result.player));
		if (!name.trim()) setName(result.player.name);
	};

	const handleBuildingJson = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setJsonError("");
		setBuildingData(null);
		setBuildingFileName("");

		const reader = new FileReader();
		reader.onload = (ev) => {
			try {
				const json = JSON.parse(ev.target?.result as string);
				if (isExportDataFormat(json)) {
					setBuildingData(mapExportDataToVillageData(json));
					setBuildingFileName(file.name);
				} else {
					const village = json as VillageData;
					if (!village.homeVillage || !village.builderBase || !village.clanCapital) {
						setJsonError(
							"File does not appear to be a valid building data file. Use exportData.json from the game or a previously exported village JSON."
						);
						return;
					}
					setBuildingData(village);
					setBuildingFileName(file.name);
				}
			} catch {
				setJsonError("Could not parse file — ensure it is valid JSON.");
			}
		};
		reader.readAsText(file);
	};

	const buildVillageData = (): VillageData => {
		if (mode === "fresh") {
			return createDefaultVillageData(townHallLevel, builderHallLevel);
		}
		// Import mode — apiData is always present if canCreate is true
		if (apiData && buildingData) {
			return mergeWithBuildingData(apiData, buildingData);
		}
		return apiData!;
	};

	const handleCreate = () => {
		if (!canCreate) return;
		addPlaythrough({
			name: name.trim(),
			description: description.trim() || undefined,
			data: buildVillageData(),
		});
		handleClose();
	};

	const handleModeSwitch = (next: CreationMode) => {
		setMode(next);
		setFetchError("");
		setJsonError("");
		setFetchedPlayer(null);
		setApiData(null);
		setBuildingData(null);
		setBuildingFileName("");
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleClose = () => {
		setMode("fresh");
		setName("");
		setDescription("");
		setTownHallLevel(1);
		setBuilderHallLevel(1);
		setPlayerTag("");
		setFetchError("");
		setFetchedPlayer(null);
		setApiData(null);
		setJsonError("");
		setBuildingData(null);
		setBuildingFileName("");
		if (fileInputRef.current) fileInputRef.current.value = "";
		onClose();
	};

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<Modal show={isOpen} onClose={handleClose}>
			<ModalHeader>Create New Village</ModalHeader>
			<ModalBody>
				<div className="space-y-5">
					{/* Mode selector */}
					<div className="grid grid-cols-2 gap-3">
						<button
							type="button"
							onClick={() => handleModeSwitch("fresh")}
							className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
								mode === "fresh"
									? "border-primary bg-primary text-white"
									: "border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:bg-primary/5 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
							}`}
						>
							<HiSparkles className="h-5 w-5 shrink-0" />
							<div>
								<div className="font-medium">Fresh Start</div>
								<div className={`text-xs ${mode === "fresh" ? "text-white/70" : "text-gray-400"}`}>
									Start with empty data
								</div>
							</div>
						</button>
						<button
							type="button"
							onClick={() => handleModeSwitch("import")}
							className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
								mode === "import"
									? "border-primary bg-primary text-white"
									: "border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:bg-primary/5 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
							}`}
						>
							<HiCloudDownload className="h-5 w-5 shrink-0" />
							<div>
								<div className="font-medium">Import</div>
								<div className={`text-xs ${mode === "import" ? "text-white/70" : "text-gray-400"}`}>
									API + optional building JSON
								</div>
							</div>
						</button>
					</div>

					{/* Village name — always shown */}
					<div>
						<div className="mb-2 block">
							<Label htmlFor="playthrough-name">
								Village Name{" "}
								<span className="text-red-600 dark:text-red-400">*</span>
							</Label>
						</div>
						<TextInput
							id="playthrough-name"
							placeholder="e.g., My Main Account"
							value={name}
							onChange={(e) => setName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleCreate()}
							required
						/>
					</div>

					{/* Fresh start options */}
					{mode === "fresh" && (
						<div className="grid grid-cols-2 gap-4">
							<div>
								<div className="mb-2 block">
									<Label htmlFor="town-hall-level">Town Hall Level</Label>
								</div>
								<Select
									id="town-hall-level"
									value={townHallLevel}
									onChange={(e) => setTownHallLevel(Number(e.target.value))}
								>
									{TH_LEVELS.map((lvl) => (
										<option key={lvl} value={lvl}>
											Level {lvl}
										</option>
									))}
								</Select>
							</div>
							<div>
								<div className="mb-2 block">
									<Label htmlFor="builder-hall-level">Builder Hall Level</Label>
								</div>
								<Select
									id="builder-hall-level"
									value={builderHallLevel}
									onChange={(e) => setBuilderHallLevel(Number(e.target.value))}
								>
									{BH_LEVELS.map((lvl) => (
										<option key={lvl} value={lvl}>
											Level {lvl}
										</option>
									))}
								</Select>
							</div>
						</div>
					)}

					{/* Import options */}
					{mode === "import" && (
						<div className="space-y-4">
							{/* Step 1 — API */}
							<div>
								<p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
									Step 1 — Fetch player data
								</p>
								<div className="mb-2 block">
									<Label htmlFor="player-tag">Player Tag</Label>
								</div>
								<div className="flex gap-2">
									<TextInput
										id="player-tag"
										placeholder="#PPV2YV9R"
										value={playerTag}
										onChange={(e) => setPlayerTag(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && handleFetchPlayer()}
										className="flex-1"
									/>
									<Button
										onClick={handleFetchPlayer}
										disabled={!playerTag.trim() || fetching}
									>
										{fetching ? <Spinner size="sm" /> : "Fetch"}
									</Button>
								</div>
								{fetchError && (
									<Alert color="failure" icon={HiExclamationCircle} className="mt-2">
										{fetchError}
									</Alert>
								)}
								{fetchedPlayer && (
									<Alert color="success" className="mt-2">
										<span className="font-medium">{fetchedPlayer.name}</span>
										{" — TH"}
										{fetchedPlayer.townHallLevel}
										{fetchedPlayer.builderHallLevel
											? `, BH${fetchedPlayer.builderHallLevel}`
											: ""}
										{" · "}
										{fetchedPlayer.achievements?.length ?? 0} achievements,{" "}
										{fetchedPlayer.troops?.length ?? 0} troops imported
									</Alert>
								)}
							</div>

							{/* Step 2 — Building JSON */}
							<div>
								<p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
									Step 2 — Building data (optional)
								</p>
								<Alert color="info" icon={HiInformationCircle} className="mb-3">
									<p className="text-xs">
										The API does not include building levels. Upload a previously exported
										village JSON from Settings to import building data.
									</p>
								</Alert>
								<div className="mb-2 block">
									<Label htmlFor="building-json">Village JSON File</Label>
								</div>
								<FileInput
									id="building-json"
									ref={fileInputRef}
									accept=".json"
									onChange={handleBuildingJson}
								/>
								{jsonError && (
									<Alert color="failure" icon={HiExclamationCircle} className="mt-2">
										{jsonError}
									</Alert>
								)}
								{buildingData && (
									<Alert color="success" className="mt-2">
										Building data loaded from{" "}
										<span className="font-medium">{buildingFileName}</span>
									</Alert>
								)}
							</div>
						</div>
					)}

					{/* Description — always shown */}
					<div>
						<div className="mb-2 block">
							<Label htmlFor="playthrough-description">Description</Label>
						</div>
						<Textarea
							id="playthrough-description"
							placeholder="Add a description for this village..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={2}
						/>
					</div>
				</div>
			</ModalBody>
			<ModalFooter>
				<Button onClick={handleCreate} disabled={!canCreate} color="action">
					Create
				</Button>
				<Button color="gray" onClick={handleClose}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	);
}
