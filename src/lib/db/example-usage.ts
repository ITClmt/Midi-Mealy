/**
 * Exemples d'utilisation du client Supabase dans l'application
 *
 * Documentation complète : https://supabase.com/docs/reference/javascript
 */

import { supabase } from "./supabase";

// ==========================================
// RESTAURANTS - Exemples CRUD
// ==========================================

/**
 * Récupérer tous les restaurants
 */
export const getAllRestaurants = async () => {
	const { data, error } = await supabase
		.from("restaurants")
		.select("*")
		.order("avg_rating", { ascending: false });

	if (error) throw error;
	return data;
};

/**
 * Récupérer un restaurant par ID avec ses avis
 */
export const getRestaurantWithReviews = async (id: number) => {
	const { data, error } = await supabase
		.from("restaurants")
		.select(`
      *,
      reviews (
        id,
        user_name,
        rating,
        comment,
        created_at
      )
    `)
		.eq("id", id)
		.single();

	if (error) throw error;
	return data;
};

/**
 * Créer un nouveau restaurant
 */
export const createRestaurant = async (restaurant: {
	name: string;
	address?: string;
	lat: number;
	lng: number;
}) => {
	const { data, error } = await supabase
		.from("restaurants")
		.insert(restaurant)
		.select()
		.single();

	if (error) throw error;
	return data;
};

/**
 * Rechercher des restaurants par nom
 */
export const searchRestaurants = async (searchTerm: string) => {
	const { data, error } = await supabase
		.from("restaurants")
		.select("*")
		.ilike("name", `%${searchTerm}%`)
		.order("avg_rating", { ascending: false });

	if (error) throw error;
	return data;
};

/**
 * Récupérer les restaurants proches d'une position
 * Note: Pour des requêtes géospatiales avancées, utiliser des fonctions PostgreSQL custom
 */
export const getNearbyRestaurants = async (
	lat: number,
	lng: number,
	radiusKm = 1,
) => {
	// Cette requête est un exemple basique
	// Pour une vraie implémentation, créer une fonction PostgreSQL avec PostGIS
	const { data, error } = await supabase
		.from("restaurants")
		.select("*")
		.order("avg_rating", { ascending: false });

	if (error) throw error;

	// Filtrer côté client (temporaire, mieux de faire côté serveur)
	return data?.filter((restaurant) => {
		const distance = calculateDistance(
			lat,
			lng,
			restaurant.lat,
			restaurant.lng,
		);
		return distance <= radiusKm;
	});
};

// ==========================================
// REVIEWS - Exemples CRUD
// ==========================================

/**
 * Créer un nouvel avis
 */
export const createReview = async (review: {
	restaurant_id: number;
	user_name: string;
	rating: number;
	comment?: string;
}) => {
	const { data, error } = await supabase
		.from("reviews")
		.insert(review)
		.select()
		.single();

	if (error) throw error;

	// Après création, mettre à jour les stats du restaurant
	await updateRestaurantStats(review.restaurant_id);

	return data;
};

/**
 * Récupérer les avis d'un restaurant
 */
export const getRestaurantReviews = async (restaurantId: number) => {
	const { data, error } = await supabase
		.from("reviews")
		.select("*")
		.eq("restaurant_id", restaurantId)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data;
};

// ==========================================
// FONCTIONS UTILITAIRES
// ==========================================

/**
 * Mettre à jour les statistiques d'un restaurant (moyenne et nombre d'avis)
 */
const updateRestaurantStats = async (restaurantId: number) => {
	// Récupérer tous les avis du restaurant
	const { data: reviews, error } = await supabase
		.from("reviews")
		.select("rating")
		.eq("restaurant_id", restaurantId);

	if (error) throw error;

	if (reviews && reviews.length > 0) {
		const avgRating =
			reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

		await supabase
			.from("restaurants")
			.update({
				avg_rating: avgRating,
				ratings_count: reviews.length,
			})
			.eq("id", restaurantId);
	}
};

/**
 * Calculer la distance entre deux points (formule Haversine)
 */
const calculateDistance = (
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number => {
	const R = 6371; // Rayon de la Terre en km
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) *
			Math.cos(toRad(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

const toRad = (deg: number): number => deg * (Math.PI / 180);

// ==========================================
// EXEMPLE D'UTILISATION DANS UN COMPOSANT
// ==========================================

/**
 * Exemple dans une route TanStack Start:
 *
 * import { createFileRoute } from '@tanstack/react-router'
 * import { getAllRestaurants } from '@/lib/db/example-usage'
 *
 * export const Route = createFileRoute('/restaurants')({
 *   loader: async () => {
 *     const restaurants = await getAllRestaurants()
 *     return { restaurants }
 *   },
 *   component: RestaurantsPage
 * })
 *
 * function RestaurantsPage() {
 *   const { restaurants } = Route.useLoaderData()
 *
 *   return (
 *     <div>
 *       {restaurants.map(restaurant => (
 *         <div key={restaurant.id}>{restaurant.name}</div>
 *       ))}
 *     </div>
 *   )
 * }
 */
