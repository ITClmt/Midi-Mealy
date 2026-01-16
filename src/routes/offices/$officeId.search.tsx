import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { RestaurantList } from "@/components/restaurants/RestaurantList";
import {
	fetchOfficeById,
	fetchOSMRestaurants,
} from "@/services/offices/offices.api";
import type { Restaurant as OSMRestaurant } from "@/services/offices/offices.types";
import type { Restaurant } from "@/services/restaurants/restaurants.types";
import { fetchRestaurantRatings } from "@/services/reviews/reviews.api";

export const Route = createFileRoute("/offices/$officeId/search")({
	component: SearchComponent,
	loader: async ({ params }) => {
		return await fetchOfficeById({ data: Number(params.officeId) });
	},
});

function SearchComponent() {
	const office = Route.useLoaderData();
	const { officeId } = Route.useParams();
	const { authState } = Route.useRouteContext();

	// Sauvegarder le dernier officeId visité
	useEffect(() => {
		if (typeof window !== "undefined") {
			sessionStorage.setItem("lastOfficeId", officeId);
		}
	}, [officeId]);

	const { data: osmRestaurants, isPending } = useQuery({
		queryKey: ["restaurants", office.id],
		queryFn: () =>
			fetchOSMRestaurants({
				data: { lat: office.lat, lng: office.lng },
			}),
	});

	const { data: ratings } = useQuery({
		queryKey: ["restaurant-ratings", office.id],
		queryFn: () =>
			fetchRestaurantRatings({
				data: (osmRestaurants || []).map((r) => r.id),
			}),
		enabled: !!osmRestaurants && osmRestaurants.length > 0,
	});

	const mappedRestaurants: Restaurant[] = (osmRestaurants || []).map(
		(restaurant: OSMRestaurant) => ({
			id: restaurant.id,
			name: restaurant.name,
			address: restaurant.address || "",
			latitude: restaurant.lat,
			longitude: restaurant.lng,
			rating: ratings?.[restaurant.id]?.averageRating || 0,
			reviewCount: ratings?.[restaurant.id]?.reviewCount || 0,
			cuisine: restaurant.cuisine || undefined,
		}),
	);

	if (isPending) {
		return (
			<div className="flex flex-1">
				<Sidebar officeId={officeId} userId={authState?.user?.id} />
				<section className="flex-1 flex items-center justify-center">
					<div className="flex flex-col items-center gap-4">
						<div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
						<p className="text-muted-foreground">
							Chargement des restaurants...
						</p>
					</div>
				</section>
			</div>
		);
	}

	return (
		<div className="flex flex-1">
			<Sidebar officeId={officeId} userId={authState?.user?.id} />
			<main className="flex-1 bg-background pb-16 md:pb-0 overflow-auto">
				<RestaurantList restaurants={mappedRestaurants} />
			</main>
		</div>
	);
}
