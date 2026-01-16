import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/db/supabase";
import type { CreateReviewDTO, Review } from "./reviews.types";

export const createReview = createServerFn({ method: "POST" })
	.inputValidator((data: CreateReviewDTO) => data)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();

		// Check if user is authenticated
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error("Vous devez être connecté pour laisser un avis");
		}

		// Check if user already has a review for this restaurant
		const { data: existingReview } = await supabase
			.from("reviews")
			.select("id")
			.eq("restaurant_id", data.restaurant_id)
			.eq("user_id", user.id)
			.single();

		if (existingReview) {
			throw new Error(
				"Vous avez déjà laissé un avis pour ce restaurant. Modifiez-le plutôt.",
			);
		}

		const { data: review, error } = await supabase
			.from("reviews")
			.insert({
				restaurant_id: data.restaurant_id,
				restaurant_name: data.restaurant_name,
				rating: data.rating,
				comment: data.comment,
				user_id: user.id,
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating review:", error);
			throw new Error("Erreur lors de la création de l'avis");
		}

		return review as Review;
	});

export const updateReview = createServerFn({ method: "POST" })
	.inputValidator(
		(data: { reviewId: string; rating: number; comment?: string }) => data,
	)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error("Vous devez être connecté pour modifier un avis");
		}

		const { data: review, error } = await supabase
			.from("reviews")
			.update({
				rating: data.rating,
				comment: data.comment,
			})
			.eq("id", data.reviewId)
			.eq("user_id", user.id) // Ensure user can only update their own review
			.select()
			.single();

		if (error) {
			console.error("Error updating review:", error);
			throw new Error("Erreur lors de la modification de l'avis");
		}

		return review as Review;
	});

export const deleteReview = createServerFn({ method: "POST" })
	.inputValidator((reviewId: string) => reviewId)
	.handler(async ({ data: reviewId }) => {
		const supabase = getSupabaseServerClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error("Vous devez être connecté pour supprimer un avis");
		}

		const { error } = await supabase
			.from("reviews")
			.delete()
			.eq("id", reviewId)
			.eq("user_id", user.id); // Ensure user can only delete their own review

		if (error) {
			console.error("Error deleting review:", error);
			throw new Error("Erreur lors de la suppression de l'avis");
		}

		return { success: true };
	});

export const fetchUserReviewForRestaurant = createServerFn({ method: "GET" })
	.inputValidator((restaurantId: string) => restaurantId)
	.handler(async ({ data: restaurantId }) => {
		const supabase = getSupabaseServerClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return null;
		}

		const { data: review } = await supabase
			.from("reviews")
			.select("*")
			.eq("restaurant_id", restaurantId)
			.eq("user_id", user.id)
			.single();

		return review as Review | null;
	});

export const fetchReviewsByRestaurantId = createServerFn({ method: "GET" })
	.inputValidator((restaurantId: string) => restaurantId)
	.handler(async ({ data: restaurantId }) => {
		const supabase = getSupabaseServerClient();

		const { data, error } = await supabase
			.from("reviews")
			.select("*")
			.eq("restaurant_id", restaurantId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching reviews:", error);
			throw new Error("Erreur lors de la récupération des avis");
		}

		return data as Review[];
	});

export const fetchTopRestaurants = createServerFn({ method: "POST" })
	.inputValidator((restaurantIds: string[]) => restaurantIds)
	.handler(async ({ data: restaurantIds }) => {
		const supabase = getSupabaseServerClient();

		if (!restaurantIds.length) return [];

		const { data: reviews, error } = await supabase
			.from("reviews")
			.select("*")
			.in("restaurant_id", restaurantIds);

		if (error) {
			console.error("Error fetching reviews for top list:", error);
			throw new Error(
				"Erreur lors de la récupération des meilleurs restaurants",
			);
		}

		// Aggregate ratings
		const restaurantStats = reviews.reduce(
			(acc, review) => {
				if (!acc[review.restaurant_id]) {
					acc[review.restaurant_id] = {
						id: review.restaurant_id,
						name: review.restaurant_name,
						totalRating: 0,
						count: 0,
					};
				}
				acc[review.restaurant_id].totalRating += review.rating;
				acc[review.restaurant_id].count += 1;
				return acc;
			},
			{} as Record<
				string,
				{ id: string; name: string; totalRating: number; count: number }
			>,
		);

		// Calculate average and sort
		const topRestaurants = (
			Object.values(restaurantStats) as {
				id: string;
				name: string;
				totalRating: number;
				count: number;
			}[]
		)
			.map((stat) => ({
				id: stat.id,
				name: stat.name,
				averageRating: stat.totalRating / stat.count,
				reviewCount: stat.count,
			}))
			.sort((a, b) => b.averageRating - a.averageRating)
			.slice(0, 3);

		return topRestaurants;
	});

export const fetchRestaurantRatings = createServerFn({ method: "POST" })
	.inputValidator((restaurantIds: string[]) => restaurantIds)
	.handler(async ({ data: restaurantIds }) => {
		const supabase = getSupabaseServerClient();

		if (!restaurantIds.length) return {};

		const { data: reviews, error } = await supabase
			.from("reviews")
			.select("restaurant_id, rating")
			.in("restaurant_id", restaurantIds);

		if (error) {
			console.error("Error fetching reviews for ratings:", error);
			throw new Error("Erreur lors de la récupération des notes");
		}

		// Aggregate ratings
		const ratingsMap = reviews.reduce(
			(acc, review) => {
				if (!acc[review.restaurant_id]) {
					acc[review.restaurant_id] = {
						totalRating: 0,
						count: 0,
					};
				}
				acc[review.restaurant_id].totalRating += review.rating;
				acc[review.restaurant_id].count += 1;
				return acc;
			},
			{} as Record<string, { totalRating: number; count: number }>,
		);

		// Calculate averages
		const result = Object.entries(ratingsMap).reduce(
			(acc, [id, stats]) => {
				acc[id] = {
					averageRating: stats.totalRating / stats.count,
					reviewCount: stats.count,
				};
				return acc;
			},
			{} as Record<string, { averageRating: number; reviewCount: number }>,
		);

		return result;
	});
