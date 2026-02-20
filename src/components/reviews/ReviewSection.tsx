import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { Office } from "@/services/offices/offices.types";
import type { Restaurant } from "@/services/restaurants/restaurants.types";
import { fetchTopRestaurants } from "@/services/reviews/reviews.api";
import { ReviewCard } from "./ReviewCard";

interface ReviewSectionProps {
	office: Office;
	restaurants: Restaurant[];
}

export default function ReviewSection({
	office,
	restaurants,
}: ReviewSectionProps) {
	const { data: topRestaurants, isPending } = useQuery({
		queryKey: ["top-restaurants", office.id],
		queryFn: () => fetchTopRestaurants({ data: restaurants.map((r) => r.id) }),
		enabled: restaurants.length > 0,
	});

	if (isPending) {
		return (
			<div className="m-12 animate-pulse">
				<div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
					))}
				</div>
			</div>
		);
	}

	if (!topRestaurants || topRestaurants.length === 0) {
		return (
			<section className="m-12 container mx-auto px-4">
				<h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
					Pas de coups de cœur pour le moment...
				</h2>
			</section>
		);
	}

	return (
		<section className="m-12 container mx-auto px-4">
			<h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
				Les coups de cœur à {office.name} ❤️
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{topRestaurants.map((restaurant, index) => (
					<Link
						key={restaurant.id}
						to="/restaurant/$restaurantId"
						params={{ restaurantId: restaurant.id }}
					>
						<ReviewCard
							key={restaurant.id}
							review={restaurant}
							rank={index + 1}
						/>
					</Link>
				))}
			</div>
		</section>
	);
}
