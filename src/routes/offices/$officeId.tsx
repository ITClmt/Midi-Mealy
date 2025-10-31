import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Search, Users, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { RestaurantMapContainer } from "@/components/RestaurantMapContainer";
import { Input } from "@/components/ui/input";
import {
	fetchOfficeById,
	fetchOSMRestaurants,
} from "@/services/offices/offices.api";
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

	const [search, setSearch] = useState("");
	const [selectedRestaurantId, setSelectedRestaurantId] = useState<
		string | undefined
	>(undefined);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const autocompleteRef = useRef<HTMLDivElement>(null);
	const suggestionsId = useId();

	const {
		isPending,
		isError,
		data: restaurants,
		error,
	} = useQuery({
		queryKey: ["restaurants", office.id],
		queryFn: () =>
			fetchOSMRestaurants({
				data: { lat: office.lat, lng: office.lng },
			}),
	});

	// Fermer les suggestions quand on clique en dehors
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				autocompleteRef.current &&
				!autocompleteRef.current.contains(e.target as Node)
			) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener("click", handleClickOutside);
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);

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

	// Filtrer les restaurants selon la recherche
	const filteredRestaurants =
		restaurants?.filter(
			(restaurant) =>
				restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
				restaurant.address?.toLowerCase().includes(search.toLowerCase()),
		) || [];

	const mappedRestaurants: Restaurant[] = (restaurants || []).map(
		(restaurant) => ({
			id: restaurant.id,
			name: restaurant.name,
			address: restaurant.address || "",
			latitude: restaurant.lat,
			longitude: restaurant.lng,
			rating: 4.0,
			cuisine: restaurant.cuisine || undefined,
		}),
	);

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
		<main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
			{/* Hero Section */}
			<section className="container mx-auto px-4">
				<div className="text-center space-y-6 max-w-4xl mx-auto">
					{/* Title & Description */}
					<div className="space-y-4 pt-12">
						<h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
							Restaurants {office.name}
						</h1>
						<p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
							Découvrez les meilleurs restaurants à proximité de {office.name}
						</p>
					</div>
				</div>

				{/* Restaurants Stats */}
				{restaurants && restaurants.length > 0 && (
					<section className="mt-8">
						<div className="text-center mb-8">
							<div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
								<Users className="w-4 h-4" />
								{restaurants.length} restaurants trouvés à proximité de{" "}
								{office.name}
							</div>
						</div>
					</section>
				)}

				{/* Map Section */}
				{restaurants && restaurants.length > 0 && (
					<section className="mt-8">
						<div className="relative w-full mb-4" ref={autocompleteRef}>
							<div className="relative flex gap-2 w-full">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input
										type="text"
										placeholder="Rechercher un restaurant"
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
											const mappedRestaurant = mappedRestaurants.find(
												(r) => r.id === restaurant.id,
											);
											if (!mappedRestaurant) return null;

											return (
												<button
													key={restaurant.id}
													type="button"
													onClick={() =>
														handleSelectRestaurant(mappedRestaurant)
													}
													className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
													role="option"
													aria-selected={selectedRestaurantId === restaurant.id}
													tabIndex={0}
													onKeyDown={(e) => {
														if (e.key === "Enter" || e.key === " ") {
															e.preventDefault();
															handleSelectRestaurant(mappedRestaurant);
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
								restaurants={mappedRestaurants}
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
				)}
			</section>
		</main>
	);
}
