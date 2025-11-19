import { useMutation, useQuery } from "@tanstack/react-query";
import { createReview } from "@/services/reviews/reviews.api";
import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import FoundRestauBadge from "@/components/FoundRestauBadge";
import { RestaurantMapContainer } from "@/components/RestaurantMapContainer";
import { Input } from "@/components/ui/input";
import {
	fetchOfficeById,
	fetchOSMRestaurants,
} from "@/services/offices/offices.api";
import type { Restaurant } from "@/services/restaurants/restaurants.types";
import { toast } from "react-toastify";

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

	const [reviewSearch, setReviewSearch] = useState("");
	const [selectedReviewRestaurant, setSelectedReviewRestaurant] = useState<
		Restaurant | undefined
	>(undefined);
	const [showReviewSuggestions, setShowReviewSuggestions] = useState(false);
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const [hoveredRating, setHoveredRating] = useState(0);
	const reviewAutocompleteRef = useRef<HTMLDivElement>(null);
	const reviewSuggestionsId = useId();

	const { mutate: submitReview, isPending: isSubmittingReview } = useMutation({
		mutationFn: createReview,
		onSuccess: () => {
			toast.success("Avis envoyé avec succès !");
			// Reset form
			setReviewSearch("");
			setSelectedReviewRestaurant(undefined);
			setRating(0);
			setComment("");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

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

	// Filter restaurants for review search
	const filteredReviewRestaurants =
		restaurants?.filter(
			(restaurant) =>
				restaurant.name.toLowerCase().includes(reviewSearch.toLowerCase()) ||
				restaurant.address?.toLowerCase().includes(reviewSearch.toLowerCase()),
		) || [];

	// Close review suggestions when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				reviewAutocompleteRef.current &&
				!reviewAutocompleteRef.current.contains(e.target as Node)
			) {
				setShowReviewSuggestions(false);
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

	const handleSelectReviewRestaurant = (restaurant: Restaurant) => {
		setSelectedReviewRestaurant(restaurant);
		setReviewSearch(restaurant.name);
		setShowReviewSuggestions(false);
	};

	const handleSubmitReview = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedReviewRestaurant) return;
		if (rating === 0) {
			alert("Veuillez sélectionner une note");
			return;
		}

		submitReview({
			data: {
				restaurant_id: selectedReviewRestaurant.id,
				restaurant_name: selectedReviewRestaurant.name,
				rating,
				comment,
			},
		});
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
					<FoundRestauBadge
						restaurantsLength={restaurants?.length || 0}
						officeName={office.name}
					/>
				)}

				{/* Review Section */}
				<section className="mt-12 max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-100">
					<div className="text-center mb-8">
						<h2 className="text-3xl font-bold text-gray-900 mb-2">
							Envie de noter un restaurant ?
						</h2>
						<p className="text-gray-600">
							Partagez votre expérience avec vos collègues
						</p>
					</div>

					<form onSubmit={handleSubmitReview} className="space-y-6">
						{/* Restaurant Search for Review */}
						<div className="relative" ref={reviewAutocompleteRef}>
							<label
								htmlFor="review-search"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Rechercher un restaurant
							</label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									id="review-search"
									type="text"
									placeholder="Nom du restaurant..."
									value={reviewSearch}
									onChange={(e) => {
										setReviewSearch(e.target.value);
										setShowReviewSuggestions(true);
										if (e.target.value === "") {
											setSelectedReviewRestaurant(undefined);
										}
									}}
									onFocus={() => setShowReviewSuggestions(true)}
									className="pl-10"
									autoComplete="off"
									aria-expanded={showReviewSuggestions}
									aria-controls={reviewSuggestionsId}
									role="combobox"
								/>
							</div>

							{/* Suggestions */}
							{showReviewSuggestions &&
								reviewSearch.length > 0 &&
								!selectedReviewRestaurant &&
								filteredReviewRestaurants.length > 0 && (
									<div
										id={reviewSuggestionsId}
										className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
										role="listbox"
									>
										{filteredReviewRestaurants.map((restaurant) => {
											const mappedRestaurant = mappedRestaurants.find(
												(r) => r.id === restaurant.id,
											);
											if (!mappedRestaurant) return null;

											return (
												<button
													key={restaurant.id}
													type="button"
													onClick={() =>
														handleSelectReviewRestaurant(mappedRestaurant)
													}
													className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
												>
													<div className="font-medium text-gray-900">
														{restaurant.name}
													</div>
													<div className="text-sm text-gray-500">
														{restaurant.address}
													</div>
												</button>
											);
										})}
									</div>
								)}
						</div>

						{selectedReviewRestaurant && (
							<div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
								{/* Rating */}
								<div className="flex flex-col items-center gap-2">
									<label className="block text-sm font-medium text-gray-700">
										Votre note
									</label>
									<div className="flex gap-1">
										{[1, 2, 3, 4, 5].map((star) => (
											<button
												key={star}
												type="button"
												className="focus:outline-none transition-transform hover:scale-110"
												onMouseEnter={() => setHoveredRating(star)}
												onMouseLeave={() => setHoveredRating(0)}
												onClick={() => setRating(star)}
											>
												<svg
													className={`w-8 h-8 ${
														star <= (hoveredRating || rating)
															? "text-yellow-400 fill-yellow-400"
															: "text-gray-300"
													}`}
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
												</svg>
											</button>
										))}
									</div>
								</div>

								{/* Comment */}
								<div>
									<label
										htmlFor="comment"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Commentaire (optionnel)
									</label>
									<textarea
										id="comment"
										rows={3}
										className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
										placeholder="Racontez votre expérience..."
										value={comment}
										onChange={(e) => setComment(e.target.value)}
									/>
								</div>

								{/* Submit Button */}
								<button
									type="submit"
									disabled={isSubmittingReview || rating === 0}
									className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
								>
									{isSubmittingReview ? "Envoi en cours..." : "Envoyer mon avis"}
								</button>
							</div>
						)}
					</form>
				</section>

				{/* Map Section */}
				{restaurants && restaurants.length > 0 && (
					<section className="mt-12">
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
