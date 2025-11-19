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
