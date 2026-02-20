import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Office } from "@/services/offices/offices.types";
import { fetchOSMRestaurants } from "@/services/restaurants/restaurants.api";
import type {
	OSMRestaurant,
	Restaurant,
} from "@/services/restaurants/restaurants.types";
import { fetchRestaurantRatings } from "@/services/reviews/reviews.api";

interface UseOfficeRestaurantsResult {
	restaurants: Restaurant[];
	isPending: boolean;
	isError: boolean;
	error: Error | null;
}

export function useOfficeRestaurants(
	office: Office,
	officeId: string,
): UseOfficeRestaurantsResult {
	// Save the last visited officeId
	useEffect(() => {
		if (typeof window !== "undefined") {
			sessionStorage.setItem("lastOfficeId", officeId);
		}
	}, [officeId]);

	const {
		data: osmRestaurants,
		isPending,
		isError,
		error,
	} = useQuery({
		queryKey: ["restaurants", office.id],
		queryFn: () =>
			fetchOSMRestaurants({
				data: { lat: office.lat, lng: office.lng },
			}),
		staleTime: 5 * 60 * 1000, // 5 min — OSM data changes rarely
	});

	const { data: ratings } = useQuery({
		queryKey: ["restaurant-ratings", office.id],
		queryFn: () =>
			fetchRestaurantRatings({
				data: (osmRestaurants || []).map((r) => r.id),
			}),
		enabled: !!osmRestaurants && osmRestaurants.length > 0,
		staleTime: 2 * 60 * 1000, // 2 min — ratings can change more often
	});

	// Map OSMRestaurant → Restaurant (normalize lat/lng → latitude/longitude)
	const restaurants: Restaurant[] = (osmRestaurants || []).map(
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

	return {
		restaurants,
		isPending,
		isError,
		error: error as Error | null,
	};
}
