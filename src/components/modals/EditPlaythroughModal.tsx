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
import type { EditPlaythroughModalProps } from "@/types/components";
import { usePlaythrough } from "@/lib/contexts/PlaythroughContext";

export function EditPlaythroughModal({
	isOpen,
	currentPlaythrough,
	onClose,
}: EditPlaythroughModalProps) {
	const { updatePlaythrough } = usePlaythrough();

	const [name, setName] = useState(currentPlaythrough.name);
	const [description, setDescription] = useState(currentPlaythrough.description ?? "");

	const handleSave = () => {
		if (!name.trim()) return;

		updatePlaythrough(currentPlaythrough.id, {
			name: name.trim(),
			description: description.trim() || undefined,
		});

		handleClose();
	};

	const handleClose = () => {
		setName(currentPlaythrough.name);
		setDescription(currentPlaythrough.description ?? "");
		onClose();
	};

	return (
		<Modal show={isOpen} onClose={() => handleClose()}>
			<ModalHeader>Edit Playthrough</ModalHeader>
			<ModalBody>
				<div className="space-y-4">
					<div>
						<div className="mb-2 block">
							<Label htmlFor="edit-playthrough-name">
								Playthrough Name{" "}
								<span className="text-red-600 dark:text-red-400">*</span>
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
						<div className="mb-2 block">
							<Label htmlFor="edit-playthrough-description">Description</Label>
						</div>
						<Textarea
							id="edit-playthrough-description"
							placeholder="Add a description for this playthrough..."
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
				<Button color="gray" onClick={() => handleClose()}>
					Cancel
				</Button>
			</ModalFooter>
		</Modal>
	);
}
