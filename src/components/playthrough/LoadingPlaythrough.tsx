import { Spinner } from "flowbite-react";

interface LoadingPlaythroughProps {
	message?: string;
}

export default function LoadingPlaythrough({ message = "Loading..." }: LoadingPlaythroughProps) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
			<Spinner size="xl" />
			<p className="mt-4 text-sm">{message}</p>
		</div>
	);
}
