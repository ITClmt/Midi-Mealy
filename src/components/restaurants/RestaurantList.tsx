import { useState } from "react";
import { RestaurantSearchInput } from "@/components/restaurants/RestaurantSearchInput";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import type { Restaurant } from "@/services/restaurants/restaurants.types";

const RESTAURANTS_PER_PAGE = 10;

export function RestaurantList({ restaurants }: { restaurants: Restaurant[] }) {
	const [currentPage, setCurrentPage] = useState(1);
	const [search, setSearch] = useState("");
	const [selectedRestaurantId, setSelectedRestaurantId] = useState<
		string | undefined
	>(undefined);

	// Filter restaurants based on search
	const filteredRestaurants = search
		? restaurants.filter(
				(restaurant) =>
					restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
					restaurant.address?.toLowerCase().includes(search.toLowerCase()) ||
					restaurant.cuisine?.toLowerCase().includes(search.toLowerCase()),
			)
		: restaurants;

	// Sort restaurants by rating (highest to lowest)
	const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
		const ratingA = a.rating ?? 0;
		const ratingB = b.rating ?? 0;
		return ratingB - ratingA; // Descending order (best rated first)
	});

	const totalPages = Math.ceil(sortedRestaurants.length / RESTAURANTS_PER_PAGE);
	const startIndex = (currentPage - 1) * RESTAURANTS_PER_PAGE;
	const endIndex = startIndex + RESTAURANTS_PER_PAGE;
	const currentRestaurants = sortedRestaurants.slice(startIndex, endIndex);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleSelectRestaurant = (restaurant: Restaurant) => {
		setSelectedRestaurantId(restaurant.id);
		setSearch(restaurant.name);
		// Reset to first page when selecting a restaurant
		setCurrentPage(1);
	};

	const handleClearSearch = () => {
		setSearch("");
		setSelectedRestaurantId(undefined);
		setCurrentPage(1);
	};

	const handleSearchChange = (value: string) => {
		setSearch(value);
		setCurrentPage(1); // Reset to first page when searching
		if (value.length === 0) {
			setSelectedRestaurantId(undefined);
		}
	};

	// Generate page numbers to display
	const getPageNumbers = () => {
		const pages: (number | "ellipsis")[] = [];

		if (totalPages <= 7) {
			// Show all pages if 7 or fewer
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			if (currentPage > 3) {
				pages.push("ellipsis");
			}

			// Show pages around current page
			for (
				let i = Math.max(2, currentPage - 1);
				i <= Math.min(totalPages - 1, currentPage + 1);
				i++
			) {
				pages.push(i);
			}

			if (currentPage < totalPages - 2) {
				pages.push("ellipsis");
			}

			// Always show last page
			pages.push(totalPages);
		}

		return pages;
	};

	if (restaurants.length === 0) {
		return null;
	}

	return (
		<section className="container mx-auto py-8 max-w-6xl">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold text-gray-800">
					Tous les restaurants ({restaurants.length})
				</h2>
			</div>

			<div className="mb-6">
				<RestaurantSearchInput
					restaurants={restaurants}
					value={search}
					onChange={handleSearchChange}
					onSelect={handleSelectRestaurant}
					onClear={handleClearSearch}
					placeholder="Rechercher un restaurant..."
					selectedRestaurantId={selectedRestaurantId}
					showSuggestionsProps={false}
				/>
			</div>

			{sortedRestaurants.length === 0 && search ? (
				<div className="text-center py-12 text-gray-500">
					<p>Aucun restaurant trouvé pour "{search}"</p>
				</div>
			) : (
				<>
					<div className="space-y-2">
						{currentRestaurants.map((restaurant) => (
							<div
								key={restaurant.id}
								className="bg-white rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors"
							>
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-sm font-medium text-gray-900">
											{restaurant.name}
										</h3>
										{restaurant.address && (
											<p className="text-xs text-gray-500 mt-0.5">
												{restaurant.address}
											</p>
										)}
									</div>
									<div className="flex items-center gap-3">
										{restaurant.cuisine && (
											<span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
												{restaurant.cuisine}
											</span>
										)}
										{restaurant.rating !== undefined &&
											restaurant.rating > 0 && (
												<div className="flex items-center gap-1">
													<span className="text-sm font-medium text-gray-900">
														{restaurant.rating.toFixed(1)}
													</span>
													<span className="text-yellow-500 text-sm">★</span>
													{restaurant.reviewCount !== undefined &&
														restaurant.reviewCount > 0 && (
															<span className="text-xs text-gray-500">
																({restaurant.reviewCount})
															</span>
														)}
												</div>
											)}
									</div>
								</div>
							</div>
						))}
					</div>

					{totalPages > 1 && (
						<div className="mt-6">
							<Pagination>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											href="#"
											onClick={(e) => {
												e.preventDefault();
												if (currentPage > 1) handlePageChange(currentPage - 1);
											}}
											className={
												currentPage === 1
													? "pointer-events-none opacity-50"
													: ""
											}
										/>
									</PaginationItem>

									{getPageNumbers().map((page, index) => (
										<PaginationItem
											key={
												page === "ellipsis"
													? `ellipsis-${index}`
													: `page-${page}`
											}
										>
											{page === "ellipsis" ? (
												<PaginationEllipsis />
											) : (
												<PaginationLink
													href="#"
													onClick={(e) => {
														e.preventDefault();
														handlePageChange(page);
													}}
													isActive={currentPage === page}
												>
													{page}
												</PaginationLink>
											)}
										</PaginationItem>
									))}

									<PaginationItem>
										<PaginationNext
											href="#"
											onClick={(e) => {
												e.preventDefault();
												if (currentPage < totalPages)
													handlePageChange(currentPage + 1);
											}}
											className={
												currentPage === totalPages
													? "pointer-events-none opacity-50"
													: ""
											}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</div>
					)}
				</>
			)}
		</section>
	);
}
