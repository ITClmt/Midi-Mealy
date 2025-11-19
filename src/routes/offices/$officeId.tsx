import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	fetchOfficeById,
	fetchOSMRestaurants,
} from "@/services/offices/offices.api";
import { OfficeHero } from "@/components/offices/OfficeHero";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { OfficeMapSection } from "@/components/offices/OfficeMapSection";
import type { Restaurant as OSMRestaurant } from "@/services/offices/offices.types";
import type { Restaurant } from "@/services/restaurants/restaurants.types";

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

	if (isPending) {
		return (
			<section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
				<div className="container mx-auto px-4 py-16">
					<div className="text-center space-y-6 max-w-4xl mx-auto">
						<div className="flex flex-col items-center gap-4">
							<div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
							<p className="text-gray-600">Chargement des restaurants...</p>
						</div>
					</div>
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
			rating: 4.0,
			cuisine: restaurant.cuisine || undefined,
		}),
	);

	return (
		<main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
			<OfficeHero
				officeName={office.name}
				restaurantsLength={mappedRestaurants.length}
			/>

			<ReviewForm restaurants={mappedRestaurants} />

			{mappedRestaurants.length > 0 && (
				<OfficeMapSection office={office} restaurants={mappedRestaurants} />
			)}
		</main>
	);
}
