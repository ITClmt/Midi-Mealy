import { Star } from "lucide-react";

interface ReviewCardProps {
	review: {
		id: string;
		name: string;
		averageRating: number;
		reviewCount: number;
	};
	rank: number;
}

export function ReviewCard({ review, rank }: ReviewCardProps) {
	return (
		<div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 relative overflow-hidden transition-transform hover:scale-105">
			{/* Rank Badge */}
			<div className="absolute top-0 right-0 bg-gradient-to-bl from-orange-500 to-red-500 text-white px-4 py-2 rounded-bl-xl font-bold text-lg shadow-md">
				#{rank}
			</div>

			<h3 className="text-xl font-bold text-gray-900 mb-2 pr-12 truncate">
				{review.name}
			</h3>

			<div className="flex items-center gap-2 mb-2">
				<div className="flex gap-0.5">
					{[1, 2, 3, 4, 5].map((star) => (
						<Star
							key={star}
							className={`w-5 h-5 ${
								star <= Math.round(review.averageRating)
									? "text-yellow-400 fill-yellow-400"
									: "text-gray-200 fill-gray-200"
							}`}
						/>
					))}
				</div>
				<span className="text-lg font-bold text-gray-900">
					{review.averageRating.toFixed(1)}
				</span>
			</div>

			<p className="text-sm text-gray-500">
				Basé sur {review.reviewCount} avis
			</p>
		</div>
	);
}
