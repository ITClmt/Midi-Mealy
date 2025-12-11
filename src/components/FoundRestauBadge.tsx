import { Users } from "lucide-react";

interface FoundRestauBadgeProps {
	restaurantsLength: number;
	officeName: string;
}

export default function FoundRestauBadge({
	restaurantsLength,
	officeName,
}: FoundRestauBadgeProps) {
	return (
		<section>
			<div className="text-center mb-8">
				<div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
					<Users className="w-4 h-4" />
					{restaurantsLength} restaurants trouvés à proximité de {officeName}
				</div>
			</div>
		</section>
	);
}
