export interface Restaurant {
	id: string;
	name: string;
	address: string;
	latitude: number;
	longitude: number;
	rating?: number;
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

export interface RestaurantMapContainerProps {
	officeLogoUrl: string;
	center?: [number, number];
	zoom?: number;
	className?: string;
	restaurants?: Restaurant[];
	onRestaurantClick?: (restaurant: Restaurant) => void;
	selectedRestaurantId?: string;
}
