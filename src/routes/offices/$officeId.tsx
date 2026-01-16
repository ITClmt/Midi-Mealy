import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { OfficeHero } from "@/components/offices/OfficeHero";
import ReviewSection from "@/components/reviews/ReviewSection";
import {
	fetchOfficeById,
	fetchOSMRestaurants,
} from "@/services/offices/offices.api";
import type { Restaurant as OSMRestaurant } from "@/services/offices/offices.types";
import type { Restaurant } from "@/services/restaurants/restaurants.types";
import { fetchRestaurantRatings } from "@/services/reviews/reviews.api";

export const Route = createFileRoute("/offices/$officeId")({
	component: OfficeLayoutComponent,
	ssr: "data-only",
	loader: async ({ params }) => {
		return await fetchOfficeById({ data: Number(params.officeId) });
	},
});

function OfficeLayoutComponent() {
	const office = Route.useLoaderData();
	const { officeId } = Route.useParams();
	const { authState } = Route.useRouteContext();
	const matches = useMatches();

	// Sauvegarder le dernier officeId visité
	useEffect(() => {
		if (typeof window !== "undefined") {
			sessionStorage.setItem("lastOfficeId", officeId);
		}
	}, [officeId]);

	// Vérifier si on est sur une route enfant (search, map)
	const isChildRoute = matches.some(
		(match) =>
			match.routeId.includes("/search") || match.routeId.includes("/map"),
	);

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

	if (isError) {
		return (
			<div className="flex flex-1">
				<Sidebar officeId={officeId} userId={authState?.user?.id} />
				<div className="flex-1 p-6">Error: {error?.message}</div>
			</div>
		);
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

	// Si on est sur une route enfant, on affiche le Outlet
	if (isChildRoute) {
		return <Outlet />;
	}

	// Sinon on affiche le contenu par défaut (page principale de l'office)
	return (
		<div className="flex flex-1">
			<Sidebar officeId={officeId} userId={authState?.user?.id} />
			<main className="flex-1 bg-background pb-16 md:pb-0 overflow-auto">
				<OfficeHero
					officeName={office.name}
					restaurantsLength={mappedRestaurants.length}
				/>
				<ReviewSection office={office} restaurants={mappedRestaurants} />
			</main>
		</div>
	);
}
