import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/db/supabase";
import type { OSMElement, OSMResponse } from "@/services/offices/offices.types";
import type { OSMRestaurant } from "./restaurants.types";

/**
 * Récupère un restaurant spécifique depuis le cache OSM par son ID.
 *
 * @param data - L'ID du restaurant (format: osm_XXXXX)
 * @returns Le restaurant trouvé
 * @throws Error si le restaurant n'est pas trouvé ou a expiré
 *
 * @example
 * const restaurant = await fetchOSMRestaurantById({ data: "osm_12345678" });
 */
export const fetchOSMRestaurantById = createServerFn({ method: "GET" })
	.inputValidator((id: string) => id)
	.handler(async ({ data: restaurantId }) => {
		const supabase = getSupabaseServerClient();

		try {
			const { data: cachedData, error: cacheError } = await supabase
				.from("osm_restaurants_cache")
				.select("*")
				.eq("id", restaurantId)
				.gt("expires_at", new Date().toISOString())
				.single();

			if (cacheError || !cachedData) {
				throw new Error("Restaurant non trouvé dans le cache");
			}

			const restaurant: OSMRestaurant = {
				id: cachedData.id,
				name: cachedData.name,
				lat: cachedData.lat,
				lng: cachedData.lng,
				cuisine: cachedData.cuisine,
				address: cachedData.address,
				phone: cachedData.phone,
				website: cachedData.website,
				opening_hours: cachedData.opening_hours,
				source: cachedData.source,
			};

			return restaurant;
		} catch (error) {
			console.error("Erreur dans fetchOSMRestaurantById:", error);
			throw new Error("Restaurant introuvable ou expiré");
		}
	});

/**
 * Récupère les restaurants depuis OpenStreetMap dans une zone donnée,
 * avec cache Supabase (TTL 2h).
 *
 * Flow:
 * 1. Check Supabase cache with cache_key
 * 2. If miss → query Overpass API
 * 3. Save results to cache
 *
 * @param data - { lat, lng, radius? } coordonnées du centre et rayon en mètres
 * @returns Liste des restaurants OSM dans la zone
 *
 * @example
 * const restaurants = await fetchOSMRestaurants({
 *   data: { lat: 48.8566, lng: 2.3522, radius: 1000 }
 * });
 */
export const fetchOSMRestaurants = createServerFn({ method: "GET" })
	.inputValidator(
		(inputData: { lat: number; lng: number; radius?: number }) => inputData,
	)
	.handler(async ({ data }) => {
		try {
			// pg_cron DELETE FROM osm_restaurants_cache WHERE expires_at < NOW()

			const { lat, lng, radius = 800 } = data;

			// Validation des valeurs numériques
			if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radius)) {
				throw new Error(
					"Les paramètres 'lat', 'lng' et 'radius' doivent être des nombres valides",
				);
			}

			if (lat < -90 || lat > 90) {
				throw new Error("La latitude doit être comprise entre -90 et 90");
			}
			if (lng < -180 || lng > 180) {
				throw new Error("La longitude doit être comprise entre -180 et 180");
			}
			if (radius < 10 || radius > 10000) {
				throw new Error("Le rayon doit être compris entre 10 et 10000 mètres");
			}

			const supabase = getSupabaseServerClient();

			// Clé de cache unique basée sur les coordonnées et le rayon
			const cacheKey = `restaurants_${lat.toFixed(4)}_${lng.toFixed(4)}_${radius}`;

			// Vérifier si des données en cache existent et sont encore valides
			const { data: cachedData, error: cacheError } = await supabase
				.from("osm_restaurants_cache")
				.select("*")
				.eq("cache_key", cacheKey)
				.gt("expires_at", new Date().toISOString())
				.order("created_at", { ascending: false });

			if (!cacheError && cachedData && cachedData.length > 0) {
				console.log(
					`Cache hit: ${cachedData.length} restaurants trouvés en cache`,
				);

				const restaurants: OSMRestaurant[] = cachedData.map((item) => ({
					id: item.id,
					name: item.name,
					lat: item.lat,
					lng: item.lng,
					cuisine: item.cuisine,
					address: item.address,
					phone: item.phone,
					website: item.website,
					opening_hours: item.opening_hours,
					source: item.source,
				}));

				return restaurants;
			}

			console.log(
				`Cache miss: Récupération depuis l'API Overpass pour ${lat}, ${lng}, rayon ${radius}m`,
			);

			// Construction de la requête Overpass optimisée
			const query = `[out:json][timeout:15];
				(
				node["amenity"="restaurant"](around:${radius},${lat},${lng});
				way["amenity"="restaurant"](around:${radius},${lat},${lng});
				relation["amenity"="restaurant"](around:${radius},${lat},${lng});

				node["amenity"="fast_food"](around:${radius},${lat},${lng});
				way["amenity"="fast_food"](around:${radius},${lat},${lng});
				relation["amenity"="fast_food"](around:${radius},${lat},${lng});
				);
				out center 1000;`;

			const response = await fetch("https://overpass-api.de/api/interpreter", {
				method: "POST",
				body: query,
				headers: {
					"Content-Type": "text/plain",
					"User-Agent": "Midi-Mealy/1.0",
				},
				signal: AbortSignal.timeout(30000),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Erreur Overpass API:", response.status, errorText);
				throw new Error(
					`Erreur API Overpass: ${response.status} - ${response.statusText}`,
				);
			}

			const osmData = (await response.json()) as OSMResponse;

			if (!osmData.elements || !Array.isArray(osmData.elements)) {
				throw new Error("Format de réponse invalide de l'API Overpass");
			}

			// Normalisation et filtrage des données
			const restaurants: OSMRestaurant[] = osmData.elements
				.filter((element: OSMElement) => {
					return (
						element.tags?.name &&
						((element.lat && element.lon) || element.center)
					);
				})
				.slice(0, 1000)
				.map((element: OSMElement): OSMRestaurant | null => {
					const coords =
						element.lat && element.lon
							? { lat: element.lat, lng: element.lon }
							: element.center
								? { lat: element.center.lat, lng: element.center.lon }
								: null;

					if (!coords || !element.tags?.name) return null;

					const addressParts = [
						element.tags["addr:housenumber"],
						element.tags["addr:street"],
						element.tags["addr:postcode"],
						element.tags["addr:city"],
					].filter(Boolean);

					return {
						id: `osm_${element.id}`,
						name: element.tags.name,
						lat: coords.lat,
						lng: coords.lng,
						cuisine: element.tags.cuisine || null,
						address: addressParts.length > 0 ? addressParts.join(", ") : null,
						phone: element.tags.phone || null,
						website: element.tags.website || null,
						opening_hours: element.tags.opening_hours || null,
						source: "osm",
					};
				})
				.filter(
					(restaurant): restaurant is OSMRestaurant => restaurant !== null,
				);

			console.log(`Trouvé ${restaurants.length} restaurants dans la zone`);

			// Sauvegarder en cache (TTL de 2 heures)
			if (restaurants.length > 0) {
				const expiresAt = new Date();
				expiresAt.setHours(expiresAt.getHours() + 2);

				const cacheData = restaurants.map((restaurant) => ({
					id: restaurant.id,
					name: restaurant.name,
					lat: restaurant.lat,
					lng: restaurant.lng,
					cuisine: restaurant.cuisine,
					address: restaurant.address,
					phone: restaurant.phone,
					website: restaurant.website,
					opening_hours: restaurant.opening_hours,
					source: restaurant.source,
					cache_key: cacheKey,
					expires_at: expiresAt.toISOString(),
				}));

				// Supprimer l'ancien cache pour cette zone
				await supabase
					.from("osm_restaurants_cache")
					.delete()
					.eq("cache_key", cacheKey);

				const { error: insertError } = await supabase
					.from("osm_restaurants_cache")
					.insert(cacheData);

				if (insertError) {
					console.error("Erreur lors de la sauvegarde du cache:", insertError);
				} else {
					console.log(
						`Cache sauvegardé: ${restaurants.length} restaurants pour ${cacheKey}`,
					);
				}
			}

			return restaurants;
		} catch (error) {
			console.error("Erreur dans fetchOSMRestaurants:", error);

			if (error instanceof Error) {
				if (error.message.includes("timeout")) {
					throw new Error(
						"La requête a expiré. Veuillez réessayer avec un rayon plus petit.",
					);
				}
				if (error.message.includes("rate limit")) {
					throw new Error(
						"Trop de requêtes. Veuillez patienter avant de réessayer.",
					);
				}
				throw error;
			}

			throw new Error(
				"Erreur inattendue lors de la récupération des restaurants",
			);
		}
	});
