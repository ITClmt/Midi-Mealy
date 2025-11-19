import { useId, useRef, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
import { RestaurantMapContainer } from "@/components/RestaurantMapContainer";
import { Input } from "@/components/ui/input";
import { useClickOutside } from "@/hooks/useClickOutside";
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

export function OfficeMapSection({ office, restaurants }: OfficeMapSectionProps) {
	const [search, setSearch] = useState("");
	const [selectedRestaurantId, setSelectedRestaurantId] = useState<
		string | undefined
	>(undefined);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const autocompleteRef = useRef<HTMLDivElement>(null);
	const suggestionsId = useId();

	// Filtrer les restaurants selon la recherche
	const filteredRestaurants =
		restaurants?.filter(
			(restaurant) =>
				restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
				restaurant.address?.toLowerCase().includes(search.toLowerCase()),
		) || [];

	// Close suggestions when clicking outside
	useClickOutside(autocompleteRef, () => setShowSuggestions(false));

	const handleSelectRestaurant = (restaurant: Restaurant) => {
		setSelectedRestaurantId(restaurant.id);
		setSearch(restaurant.name);
		setShowSuggestions(false);
	};

	const handleClearSearch = () => {
		setSearch("");
		setSelectedRestaurantId(undefined);
		setShowSuggestions(false);
	};

	const handleSearchChange = (value: string) => {
		setSearch(value);
		setShowSuggestions(value.length > 0);
		if (value.length === 0) {
			setSelectedRestaurantId(undefined);
		}
	};

	return (
		<section className="mt-12 ml-12 mr-12">
			<div className="relative w-full mb-4" ref={autocompleteRef}>
				<div className="relative flex gap-2 w-full">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
						<Input
							type="text"
							placeholder="Rechercher un restaurant sur la carte"
							value={search}
							onChange={(e) => handleSearchChange(e.target.value)}
							onFocus={() => {
								if (search.length > 0) {
									setShowSuggestions(true);
								}
							}}
							className="pl-10 pr-10"
							aria-label="Rechercher un restaurant"
							aria-expanded={showSuggestions}
							aria-controls={suggestionsId}
							role="combobox"
						/>
						{search && (
							<button
								type="button"
								onClick={handleClearSearch}
								className="absolute z-10 right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
								aria-label="Effacer la recherche"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										handleClearSearch();
									}
								}}
							>
								<X className="w-4 h-4" />
							</button>
						)}
					</div>
				</div>

				{/* Suggestions d'autocomplétion */}
				{showSuggestions &&
					filteredRestaurants.length > 0 &&
					search.length > 0 && (
						<div
							id={suggestionsId}
							className="absolute z-[1001] w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
							role="listbox"
						>
							{filteredRestaurants.map((restaurant) => {
								return (
									<button
										key={restaurant.id}
										type="button"
										onClick={() => handleSelectRestaurant(restaurant)}
										className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
										role="option"
										aria-selected={selectedRestaurantId === restaurant.id}
										tabIndex={0}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												handleSelectRestaurant(restaurant);
											}
										}}
									>
										<div className="font-medium text-gray-900">
											{restaurant.name}
										</div>
										{restaurant.address && (
											<div className="text-sm text-gray-500 mt-1">
												{restaurant.address}
											</div>
										)}
										{restaurant.cuisine && (
											<div className="text-xs text-blue-600 mt-1">
												🍽️ {restaurant.cuisine}
											</div>
										)}
									</button>
								);
							})}
						</div>
					)}

				{showSuggestions &&
					filteredRestaurants.length === 0 &&
					search.length > 0 && (
						<div className="absolute z-[1001] w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-gray-500 text-sm">
							Aucun restaurant trouvé pour "{search}"
						</div>
					)}
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
						console.log("Restaurant sélectionné:", restaurant);
						setSelectedRestaurantId(restaurant.id);
						setSearch(restaurant.name);
						setShowSuggestions(false);
					}}
				/>
			</div>
		</section>
	);
}
