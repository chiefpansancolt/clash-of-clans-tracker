import {
	Button,
	Label,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Textarea,
	TextInput,
} from "flowbite-react";
import { useState } from "react";
import type { CreatePlaythroughModalProps } from "@/types/components";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";

export function CreatePlaythroughModal({ isOpen, onClose }: CreatePlaythroughModalProps) {
	const { addPlaythrough } = usePlaythrough();

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const handleCreate = () => {
		if (!name.trim()) return;

		addPlaythrough({
			name: name.trim(),
			description: description.trim() || undefined,
			data: {},
		});

		handleClose();
	};

	const handleClose = () => {
		setName("");
		setDescription("");
		onClose();
	};

	return (
		<Modal show={isOpen} onClose={() => handleClose()}>
			<ModalHeader>Create New Playthrough</ModalHeader>
			<ModalBody>
				<div className="space-y-4">
					<div>
						<div className="mb-2 block">
							<Label htmlFor="playthrough-name">
								Playthrough Name{" "}
								<span className="text-red-600 dark:text-red-400">*</span>
							</Label>
						</div>
						<TextInput
							id="playthrough-name"
							placeholder="e.g., My First Run"
							value={name}
							onChange={(e) => setName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleCreate()}
							required
						/>
					</div>
					<div>
						<div className="mb-2 block">
							<Label htmlFor="playthrough-description">Description</Label>
						</div>
						<Textarea
							id="playthrough-description"
							placeholder="Add a description for this playthrough..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
						/>
					</div>
				</div>
			</ModalBody>
			<ModalFooter>
				<Button onClick={handleCreate} disabled={!name.trim()}>
					Create
				</Button>
				<Button color="gray" onClick={() => handleClose()}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	);
}
