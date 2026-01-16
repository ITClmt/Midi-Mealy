import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { fetchOSMRestaurantById } from "@/services/offices/offices.api";
import type { Restaurant } from "@/services/restaurants/restaurants.types";
import { fetchRestaurantRatings } from "@/services/reviews/reviews.api";

export const Route = createFileRoute("/restaurant/$restaurantId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { restaurantId } = Route.useParams();

	const {
		isPending,
		isError,
		data: osmRestaurant,
		error,
	} = useQuery({
		queryKey: ["restaurant", restaurantId],
		queryFn: () =>
			fetchOSMRestaurantById({
				data: restaurantId,
			}),
	});

	const { data: ratings } = useQuery({
		queryKey: ["restaurant-rating", restaurantId],
		queryFn: () =>
			fetchRestaurantRatings({
				data: [restaurantId],
			}),
		enabled: !!osmRestaurant,
	});

	if (isPending) {
		return (
			<section className="min-h-screen bg-background flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
					<p className="text-muted-foreground">Chargement du restaurant...</p>
				</div>
			</section>
		);
	}

	if (isError || !osmRestaurant) {
		return (
			<section className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						Restaurant introuvable
					</h1>
					<p className="text-gray-600">
						{error?.message || "Ce restaurant n'existe pas"}
					</p>
				</div>
			</section>
		);
	}

	const restaurant: Restaurant = {
		id: osmRestaurant.id,
		name: osmRestaurant.name,
		address: osmRestaurant.address || "",
		latitude: osmRestaurant.lat,
		longitude: osmRestaurant.lng,
		rating: ratings?.[restaurantId]?.averageRating || 0,
		reviewCount: ratings?.[restaurantId]?.reviewCount || 0,
		cuisine: osmRestaurant.cuisine || undefined,
	};

	return (
		<main className="min-h-screen bg-background pb-16">
			<div className="container mx-auto py-8 max-w-6xl">
				<ReviewForm restaurant={restaurant} />
			</div>
		</main>
	);
}
