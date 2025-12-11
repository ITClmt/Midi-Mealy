import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { OfficeHero } from "@/components/offices/OfficeHero";
import { OfficeMapSection } from "@/components/offices/OfficeMapSection";
import { RestaurantList } from "@/components/restaurants/RestaurantList";
import ReviewSection from "@/components/reviews/ReviewSection";
import {
	fetchOfficeById,
	fetchOSMRestaurants,
} from "@/services/offices/offices.api";
import type { Restaurant as OSMRestaurant } from "@/services/offices/offices.types";
import type { Restaurant } from "@/services/restaurants/restaurants.types";
import { fetchRestaurantRatings } from "@/services/reviews/reviews.api";

export const Route = createFileRoute("/offices/$officeId")({
	component: RestaurantComponent,
	ssr: "data-only",
	loader: async ({ params }) => {
		return await fetchOfficeById({ data: Number(params.officeId) });
	},
});

function RestaurantComponent() {
	const office = Route.useLoaderData();

	const {
		isPending,
		isError,
		data: osmRestaurants,
		error,
	} = useQuery({
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

	if (isPending) {
		return (
			<section className="min-h-screen bg-background flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
					<p className="text-muted-foreground">Chargement des restaurants...</p>
				</div>
			</section>
		);
	}

	if (isError) {
		return <div>Error: {error?.message}</div>;
	}

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

	return (
		<main className="min-h-screen bg-background pb-16">
			<OfficeHero
				officeName={office.name}
				restaurantsLength={mappedRestaurants.length}
			/>

			<ReviewSection office={office} restaurants={mappedRestaurants} />

			<RestaurantList restaurants={mappedRestaurants} />

			{mappedRestaurants.length > 0 && (
				<OfficeMapSection office={office} restaurants={mappedRestaurants} />
			)}
		</main>
	);
}
