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
	Spinner,
	Textarea,
	TextInput,
} from "flowbite-react";
import { useRef, useState } from "react";
import { HiExclamationCircle, HiRefresh } from "react-icons/hi";
import { fetchPlayerByTag } from "@/app/actions/fetchPlayer";
import { useApiCooldown } from "@/lib/hooks/useApiCooldown";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { isExportDataFormat, mapExportDataToVillageData } from "@/lib/utils/exportDataMapper";
import { mapPlayerApiToVillageData, mergeWithBuildingData } from "@/lib/utils/playerApiMapper";
import { mergeApiAchievements } from "@/lib/utils/achievementHelpers";
import type { EditPlaythroughModalProps } from "@/types/components";
import type { PlayerApiResponse } from "@/types/app";
import type { VillageData } from "@/types/app/game";

const toDateInputValue = (iso?: string): string  => {
	if (!iso) return "";
	return iso.split("T")[0];
}

const fromDateInputValue = (val: string): string | undefined  => {
	if (!val) return undefined;
	return new Date(val + "T00:00:00.000Z").toISOString();
}

export const EditPlaythroughModal = ({
	isOpen,
	currentPlaythrough,
	onClose,
}: EditPlaythroughModalProps) => {
	const { updatePlaythrough } = usePlaythrough();

	const [name, setName] = useState(currentPlaythrough.name);
	const [description, setDescription] = useState(currentPlaythrough.description ?? "");
	const [thChangedAt, setThChangedAt] = useState(toDateInputValue(currentPlaythrough.thChangedAt));
	const [bhChangedAt, setBhChangedAt] = useState(toDateInputValue(currentPlaythrough.bhChangedAt));

	const [playerTag, setPlayerTag] = useState(currentPlaythrough.data.playerTag ?? "");
	const [fetching, setFetching] = useState(false);
	const [fetchError, setFetchError] = useState("");
	const [fetchedPlayer, setFetchedPlayer] = useState<PlayerApiResponse | null>(null);
	const [refreshedData, setRefreshedData] = useState<VillageData | null>(null);
	const { secondsLeft, isOnCooldown, startCooldown, handleError } = useApiCooldown();

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [jsonError, setJsonError] = useState("");
	const [buildingData, setBuildingData] = useState<VillageData | null>(null);
	const [buildingFileName, setBuildingFileName] = useState("");

	const handleFetchPlayer = async () => {
		if (!playerTag.trim()) return;
		setFetching(true);
		setFetchError("");
		setFetchedPlayer(null);
		setRefreshedData(null);

		const result = await fetchPlayerByTag(playerTag);
		setFetching(false);

		if (!result.success) {
			setFetchError(handleError(result.error));
			return;
		}

		startCooldown();
		setFetchedPlayer(result.player);
		setRefreshedData(mapPlayerApiToVillageData(result.player));
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

	const handleSave = () => {
		if (!name.trim()) return;

		let data = currentPlaythrough.data;
		if (refreshedData) {
			// Merge API data with building source: new JSON if uploaded, otherwise keep existing buildings
			const buildingSource = buildingData ?? currentPlaythrough.data;
			data = mergeWithBuildingData(refreshedData, buildingSource);
			// Preserve achievements the user has marked as manual
			data = {
				...data,
				achievements: mergeApiAchievements(data.achievements, currentPlaythrough.data.achievements),
			};
		} else if (buildingData) {
			data = mergeWithBuildingData(currentPlaythrough.data, buildingData);
		}

		updatePlaythrough(currentPlaythrough.id, {
			name: name.trim(),
			description: description.trim() || undefined,
			thChangedAt: fromDateInputValue(thChangedAt),
			bhChangedAt: fromDateInputValue(bhChangedAt),
			data,
		});

		handleClose();
	};

	const handleClose = () => {
		setName(currentPlaythrough.name);
		setDescription(currentPlaythrough.description ?? "");
		setThChangedAt(toDateInputValue(currentPlaythrough.thChangedAt));
		setBhChangedAt(toDateInputValue(currentPlaythrough.bhChangedAt));
		setPlayerTag(currentPlaythrough.data.playerTag ?? "");
		setFetchError("");
		setFetchedPlayer(null);
		setRefreshedData(null);
		setJsonError("");
		setBuildingData(null);
		setBuildingFileName("");
		if (fileInputRef.current) fileInputRef.current.value = "";
		onClose();
	};

	return (
		<Modal show={isOpen} onClose={handleClose}>
			<ModalHeader>Edit Village</ModalHeader>
			<ModalBody>
				<div className="space-y-4">
					<div>
						<div className="mb-2 block">
							<Label htmlFor="edit-playthrough-name">
								Village Name <span className="text-red-600 dark:text-red-400">*</span>
							</Label>
						</div>
						<TextInput
							id="edit-playthrough-name"
							placeholder="e.g., My First Run"
							value={name}
							onChange={(e) => setName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSave()}
							required
						/>
					</div>

					<div>
						<p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
							Refresh Player Data
						</p>
						<div className="mb-2 block">
							<Label htmlFor="edit-player-tag">Player Tag</Label>
						</div>
						<div className="flex gap-2">
							<TextInput
								id="edit-player-tag"
								placeholder="#PPV2YV9R"
								value={playerTag}
								onChange={(e) => setPlayerTag(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleFetchPlayer()}
								className="flex-1"
							/>
							<Button onClick={handleFetchPlayer} disabled={!playerTag.trim() || fetching || isOnCooldown} className="min-w-16">
								{fetching ? <Spinner size="sm" /> : isOnCooldown ? `${secondsLeft}s` : <HiRefresh className="h-4 w-4" />}
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
								{fetchedPlayer.builderHallLevel ? `, BH${fetchedPlayer.builderHallLevel}` : ""}
								{" · "}
								{fetchedPlayer.troops?.length ?? 0} troops refreshed
							</Alert>
						)}

						{refreshedData && (
							<div className="mt-3">
								<div className="mb-2 block">
									<Label htmlFor="edit-building-json">Building JSON (optional)</Label>
								</div>
								<FileInput
									id="edit-building-json"
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
						)}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<div className="mb-2 block">
								<Label htmlFor="edit-th-changed-at">Town Hall Upgraded</Label>
							</div>
							<TextInput
								id="edit-th-changed-at"
								type="date"
								value={thChangedAt}
								onChange={(e) => setThChangedAt(e.target.value)}
							/>
						</div>
						<div>
							<div className="mb-2 block">
								<Label htmlFor="edit-bh-changed-at">Builder Hall Upgraded</Label>
							</div>
							<TextInput
								id="edit-bh-changed-at"
								type="date"
								value={bhChangedAt}
								onChange={(e) => setBhChangedAt(e.target.value)}
							/>
						</div>
					</div>

					<div>
						<div className="mb-2 block">
							<Label htmlFor="edit-playthrough-description">Description</Label>
						</div>
						<Textarea
							id="edit-playthrough-description"
							placeholder="Add a description for this village..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
						/>
					</div>
				</div>
			</ModalBody>
			<ModalFooter>
				<Button onClick={handleSave} disabled={!name.trim()}>
					Save
				</Button>
				<Button color="gray" onClick={handleClose}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	);
}
