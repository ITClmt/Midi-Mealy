import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	ChevronLeft,
	ChevronRight,
	MapPin,
	MessageSquare,
	Star,
} from "lucide-react";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { Button } from "@/components/ui/button";
import { fetchOSMRestaurantById } from "@/services/restaurants/restaurants.api";
import type { Restaurant } from "@/services/restaurants/restaurants.types";
import {
	fetchRestaurantRatings,
	fetchReviewsByRestaurantId,
} from "@/services/reviews/reviews.api";

const REVIEWS_PER_PAGE = 10;

export const Route = createFileRoute("/restaurant/$restaurantId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { restaurantId } = Route.useParams();
	const { authState } = Route.useRouteContext();
	const [currentPage, setCurrentPage] = useState(1);

	// Get last office ID from session storage for sidebar
	const lastOfficeId =
		typeof window !== "undefined"
			? sessionStorage.getItem("lastOfficeId") || ""
			: "";

	const {
		isPending,
		isError,
		data: osmRestaurant,
		error,
	} = useQuery({
		queryKey: ["restaurant", restaurantId],
		queryFn: () =>
			fetchOSMRestaurantById({
				data: restaurantId,
			}),
	});

	const { data: ratings } = useQuery({
		queryKey: ["restaurant-rating", restaurantId],
		queryFn: () =>
			fetchRestaurantRatings({
				data: [restaurantId],
			}),
		enabled: !!osmRestaurant,
	});

	const { data: reviews } = useQuery({
		queryKey: ["reviews", restaurantId],
		queryFn: () => fetchReviewsByRestaurantId({ data: restaurantId }),
		enabled: !!osmRestaurant,
	});

	if (isPending) {
		return (
			<div className="flex flex-1">
				{lastOfficeId && (
					<Sidebar officeId={lastOfficeId} userId={authState?.user?.id} />
				)}
				<section className="flex-1 flex items-center justify-center">
					<div className="flex flex-col items-center gap-4">
						<div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
						<p className="text-muted-foreground">Chargement du restaurant...</p>
					</div>
				</section>
			</div>
		);
	}

	if (isError || !osmRestaurant) {
		return (
			<div className="flex flex-1">
				{lastOfficeId && (
					<Sidebar officeId={lastOfficeId} userId={authState?.user?.id} />
				)}
				<section className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-gray-900 mb-2">
							Restaurant introuvable
						</h1>
						<p className="text-gray-600">
							{error?.message || "Ce restaurant n'existe pas"}
						</p>
					</div>
				</section>
			</div>
		);
	}

	const restaurant: Restaurant = {
		id: osmRestaurant.id,
		name: osmRestaurant.name,
		address: osmRestaurant.address || "",
		latitude: osmRestaurant.lat,
		longitude: osmRestaurant.lng,
		rating: ratings?.[restaurantId]?.averageRating || 0,
		reviewCount: ratings?.[restaurantId]?.reviewCount || 0,
		cuisine: osmRestaurant.cuisine || undefined,
	};

	const totalReviews = reviews?.length || 0;
	const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);
	const paginatedReviews = reviews?.slice(
		(currentPage - 1) * REVIEWS_PER_PAGE,
		currentPage * REVIEWS_PER_PAGE,
	);

	return (
		<div className="flex flex-1">
			{lastOfficeId && (
				<Sidebar officeId={lastOfficeId} userId={authState?.user?.id} />
			)}
			<main className="flex-1 bg-background pb-16 md:pb-0 overflow-auto">
				<div className="max-w-3xl mx-auto px-4 py-8">
					{/* Restaurant Header */}
					<header className="mb-8">
						<h1 className="text-3xl font-bold text-foreground mb-1">
							{restaurant.name}
						</h1>
						{restaurant.cuisine && (
							<span className="text-primary font-medium">
								{restaurant.cuisine}
							</span>
						)}

						{/* Rating */}
						<div className="flex items-center gap-2 mt-3">
							<div className="flex gap-0.5">
								{[1, 2, 3, 4, 5].map((star) => (
									<Star
										key={star}
										className={`w-5 h-5 ${
											star <= Math.round(restaurant.rating || 0)
												? "text-yellow-400 fill-yellow-400"
												: "text-gray-300 fill-gray-300"
										}`}
									/>
								))}
							</div>
							<span className="font-semibold text-foreground">
								{(restaurant.rating || 0).toFixed(1)}
							</span>
							<span className="text-muted-foreground">
								({restaurant.reviewCount} avis)
							</span>
						</div>

						{/* Address */}
						{restaurant.address && (
							<div className="flex items-center gap-2 mt-3 text-muted-foreground">
								<MapPin className="w-4 h-4" />
								<span>{restaurant.address}</span>
							</div>
						)}
					</header>

					{/* Review Form */}
					<section className="mb-8">
						<div className="bg-card border border-border rounded-xl p-6">
							<h2 className="text-lg font-semibold text-foreground mb-4">
								Laisser un avis
							</h2>
							<ReviewForm restaurant={restaurant} />
						</div>
					</section>

					{/* Reviews List */}
					<section>
						<div className="flex items-center gap-2 mb-4">
							<MessageSquare className="w-5 h-5 text-muted-foreground" />
							<h2 className="text-lg font-semibold text-foreground">
								Avis ({totalReviews})
							</h2>
						</div>

						{paginatedReviews && paginatedReviews.length > 0 ? (
							<div className="space-y-4">
								{paginatedReviews.map((review) => (
									<div
										key={review.id}
										className="bg-card border border-border rounded-xl p-4"
									>
										<div className="flex items-center gap-2 mb-2">
											<span className="font-medium text-foreground">
												{review.username || "Utilisateur"}
											</span>
											{review.office_name && (
												<span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
													{review.office_name}
												</span>
											)}
											<span className="text-muted-foreground">•</span>
											<div className="flex gap-0.5">
												{[1, 2, 3, 4, 5].map((star) => (
													<Star
														key={star}
														className={`w-4 h-4 ${
															star <= review.rating
																? "text-yellow-400 fill-yellow-400"
																: "text-gray-300 fill-gray-300"
														}`}
													/>
												))}
											</div>
											<span className="text-muted-foreground">•</span>
											<span className="text-sm text-muted-foreground">
												{new Date(review.created_at).toLocaleDateString(
													"fr-FR",
													{
														day: "numeric",
														month: "long",
														year: "numeric",
													},
												)}
											</span>
										</div>
										{review.comment && (
											<p className="text-foreground">{review.comment}</p>
										)}
									</div>
								))}

								{/* Pagination */}
								{totalPages > 1 && (
									<div className="flex items-center justify-center gap-2 pt-4">
										<Button
											variant="outline"
											size="icon"
											className="h-8 w-8"
											onClick={() => setCurrentPage((p) => p - 1)}
											disabled={currentPage === 1}
										>
											<ChevronLeft className="w-4 h-4" />
										</Button>
										<span className="text-sm text-muted-foreground px-2">
											{currentPage} / {totalPages}
										</span>
										<Button
											variant="outline"
											size="icon"
											className="h-8 w-8"
											onClick={() => setCurrentPage((p) => p + 1)}
											disabled={currentPage === totalPages}
										>
											<ChevronRight className="w-4 h-4" />
										</Button>
									</div>
								)}
							</div>
						) : (
							<div className="bg-card border border-border rounded-xl p-8 text-center">
								<p className="text-muted-foreground">
									Aucun avis pour le moment. Soyez le premier à partager votre
									expérience !
								</p>
							</div>
						)}
					</section>
				</div>
			</main>
		</div>
	);
}
