import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import { LuTrash2 } from "react-icons/lu";
import type { DeleteConfirmModalProps } from "@/types/components";

export function DeleteConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	title = "Confirm Delete",
	message = "Are you sure you want to delete this item?",
	itemName,
}: DeleteConfirmModalProps) {
	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	return (
		<Modal show={isOpen} onClose={onClose} size="md">
			<ModalHeader>{title}</ModalHeader>
			<ModalBody>
				<div className="text-center">
					<LuTrash2 className="mx-auto mb-4 size-12 text-gray-400 dark:text-gray-500" />
					<p className="mb-4 text-gray-500 dark:text-gray-300">
						{itemName ? (
							<>
								Are you sure you want to delete &quot;<strong>{itemName}</strong>
								&quot;?
							</>
						) : (
							message
						)}
					</p>
					<div className="flex justify-center gap-2">
						<Button color="gray" onClick={onClose}>
							No, cancel
						</Button>
						<Button color="red" onClick={handleConfirm}>
							Yes, I&apos;m sure
						</Button>
					</div>
				</div>
			</ModalBody>
		</Modal>
	);
}
