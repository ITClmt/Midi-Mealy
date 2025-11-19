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
