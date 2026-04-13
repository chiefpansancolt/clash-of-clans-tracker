import { Button, Card } from "flowbite-react";
import Link from "next/link";
import { HiHome } from "react-icons/hi";

interface NotFoundCardProps {
	title?: string;
	message?: string;
}

export default function NotFoundCard({
	title = "Not Found",
	message = "The item you are looking for does not exist.",
}: NotFoundCardProps) {
	return (
		<div className="flex items-center justify-center p-8">
			<Card className="max-w-md text-center">
				<h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
				<p className="text-gray-600 dark:text-gray-400">{message}</p>
				<Button as={Link} href="/" color="blue">
					<HiHome className="mr-2 h-5 w-5" />
					Go Home
				</Button>
			</Card>
		</div>
	);
}
