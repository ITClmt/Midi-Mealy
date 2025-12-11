import { MapPin } from "lucide-react";
import { useState } from "react";
import { RestaurantMapContainer } from "@/components/RestaurantMapContainer";
import { RestaurantSearchInput } from "@/components/restaurants/RestaurantSearchInput";
import type { Restaurant } from "@/services/restaurants/restaurants.types";

interface OfficeMapSectionProps {
	office: {
		name: string;
		lat: number;
		lng: number;
		logo_url: string;
	};
	restaurants: Restaurant[];
}

export function OfficeMapSection({
	office,
	restaurants,
}: OfficeMapSectionProps) {
	const [search, setSearch] = useState("");
	const [selectedRestaurantId, setSelectedRestaurantId] = useState<
		string | undefined
	>(undefined);

	const handleSelectRestaurant = (restaurant: Restaurant) => {
		setSelectedRestaurantId(restaurant.id);
		setSearch(restaurant.name);
	};

	const handleClearSearch = () => {
		setSearch("");
		setSelectedRestaurantId(undefined);
	};

	const handleSearchChange = (value: string) => {
		setSearch(value);
		if (value.length === 0) {
			setSelectedRestaurantId(undefined);
		}
	};

	return (
		<section className="m-0 sm:m-12 mb-0 mt-12">
			<div className="relative w-full mb-4">
				<RestaurantSearchInput
					restaurants={restaurants}
					value={search}
					onChange={handleSearchChange}
					onSelect={handleSelectRestaurant}
					onClear={handleClearSearch}
					placeholder="Rechercher un restaurant sur la carte"
					selectedRestaurantId={selectedRestaurantId}
					showSuggestionsProps={true}
				/>
			</div>

			<div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
				<div className="flex items-center gap-3 mb-6">
					<MapPin className="w-6 h-6 text-red-600" />
					<h2 className="text-2xl font-bold text-gray-900">
						Carte des restaurants à proximité de {office.name}
					</h2>
				</div>
				<RestaurantMapContainer
					center={[office.lat, office.lng]}
					officeLogoUrl={office.logo_url}
					zoom={17}
					className="w-full h-[495px] rounded-lg"
					restaurants={restaurants}
					selectedRestaurantId={selectedRestaurantId}
					onRestaurantClick={(restaurant) => {
						setSelectedRestaurantId(restaurant.id);
						setSearch(restaurant.name);
					}}
				/>
			</div>
		</section>
	);
}
