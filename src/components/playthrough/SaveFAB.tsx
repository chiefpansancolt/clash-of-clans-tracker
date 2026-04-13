/**
 * SaveFAB — Optional floating action button for pages that use a deferred-save pattern.
 *
 * Usage:
 *   const [isDirty, setIsDirty] = useState(false);
 *
 *   const handleSave = () => {
 *     // persist your data, return true on success, false on failure
 *     return true;
 *   };
 *
 *   <SaveFAB isDirty={isDirty} onSave={handleSave} />
 *
 * The button renders only when isDirty is true. It calls onSave(), then shows a
 * success or error toast based on the boolean return value.
 */
import { Spinner } from "flowbite-react";
import { useState } from "react";
import { FaRegSave } from "react-icons/fa";
import type { SaveFABProps } from "@/types/contexts";
import { errorToast, successToast } from "@/lib/notifications";

export default function SaveFAB({ isDirty, onSave }: SaveFABProps) {
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		if (!isDirty || isSaving) return;

		setIsSaving(true);
		try {
			const success = onSave();

			if (success) {
				successToast({ message: "Saved successfully!" });
			} else {
				errorToast({ message: "Failed to save changes" });
			}
		} catch (error) {
			errorToast({ message: "Error saving changes" });
			console.error(error);
		} finally {
			setTimeout(() => {
				setIsSaving(false);
			}, 800);
		}
	};

	if (!isDirty) return null;

	return (
		<button
			onClick={handleSave}
			disabled={isSaving}
			className="fixed right-6 bottom-6 z-30 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-blue-600 p-0 text-white shadow-lg transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
			aria-label="Save Progress"
		>
			{isSaving ? <Spinner size="md" color="white" /> : <FaRegSave className="h-6 w-6" />}
		</button>
	);
}
