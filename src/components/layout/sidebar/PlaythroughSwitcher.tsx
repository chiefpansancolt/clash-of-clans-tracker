import { Dropdown, DropdownDivider, DropdownHeader, DropdownItem } from "flowbite-react";
import { useState } from "react";
import { LuChevronsUpDown, LuPlus } from "react-icons/lu";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";
import { CreatePlaythroughModal } from "@/comps/modals/CreatePlaythroughModal";

export function PlaythroughSwitcher() {
	const { playthroughs, activePlaythrough, setActivePlaythrough } = usePlaythrough();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handlePlaythroughSelect = (playthroughId: string) => {
		if (activePlaythrough?.id === playthroughId) return;
		setActivePlaythrough(playthroughId);
	};

	return (
		<>
			<div className="mb-2">
				<Dropdown
					dismissOnClick={true}
					renderTrigger={() => (
						<button
							type="button"
							className="flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 text-left hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 focus:outline-none dark:hover:bg-gray-700 dark:focus:ring-gray-700"
						>
							<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-sm font-bold text-white">
								{activePlaythrough?.name?.[0]?.toUpperCase() ?? "?"}
							</div>
							<div className="min-w-0 flex-1">
								<span className="truncate text-sm font-medium text-gray-900 dark:text-white">
									{activePlaythrough?.name || "None Selected"}
								</span>
							</div>
							<LuChevronsUpDown className="size-4 shrink-0 text-gray-500 dark:text-gray-400" />
						</button>
					)}
				>
					<DropdownHeader>Playthroughs</DropdownHeader>
					{playthroughs.length === 0 ? (
						<DropdownItem disabled>No playthroughs yet</DropdownItem>
					) : (
						playthroughs.map((playthrough) => (
							<DropdownItem
								key={playthrough.id}
								onClick={() => handlePlaythroughSelect(playthrough.id)}
							>
								<div className="flex w-full items-center gap-2">
									<span className="truncate">{playthrough.name}</span>
									{activePlaythrough?.id === playthrough.id && (
										<span className="ml-auto text-xs font-medium text-blue-600 dark:text-blue-400">
											Active
										</span>
									)}
								</div>
							</DropdownItem>
						))
					)}
					<DropdownDivider />
					<DropdownItem onClick={() => setIsModalOpen(true)}>
						<div className="flex items-center gap-2">
							<div className="flex size-6 items-center justify-center rounded-md border border-gray-300 bg-transparent dark:border-gray-600">
								<LuPlus className="size-4" />
							</div>
							<span className="font-medium text-gray-500 dark:text-gray-400">
								Add Playthrough
							</span>
						</div>
					</DropdownItem>
				</Dropdown>
			</div>

			<CreatePlaythroughModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
		</>
	);
}
