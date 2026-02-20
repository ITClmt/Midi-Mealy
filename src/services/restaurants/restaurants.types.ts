/**
 * Raw restaurant data from OpenStreetMap / Overpass cache.
 * This is the server-side representation with lat/lng.
 */
export interface OSMRestaurant {
	id: string;
	name: string;
	lat: number;
	lng: number;
	cuisine: string | null;
	address: string | null;
	phone: string | null;
	website: string | null;
	opening_hours: string | null;
	source: string;
}

/**
 * Normalized restaurant for UI components.
 * Uses latitude/longitude and includes computed rating data.
 */
export interface Restaurant {
	id: string;
	name: string;
	address: string;
	latitude: number;
	longitude: number;
	rating?: number;
	reviewCount?: number;
	cuisine?: string;
}

export interface RestaurantMapProps {
	officeLogoUrl: string;
	center?: [number, number];
	zoom?: number;
	className?: string;
	restaurants?: Restaurant[];
	onRestaurantClick?: (restaurant: Restaurant) => void;
	selectedRestaurantId?: string;
}
