import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/db/supabase";
import { cleanExpiredCache } from "@/scripts/clean-cache";
import type {
	CreateOfficeInput,
	OSMElement,
	OSMResponse,
	Restaurant,
} from "./offices.types";

export const fetchOffices = createServerFn({ method: "GET" }).handler(
	async () => {
		const supabase = getSupabaseServerClient();

		const { data, error } = await supabase.from("offices").select("*");

		if (error) {
			throw new Error(error.message);
		}
		return data;
	},
);

/**
 * Géocode une adresse via l'API Nominatim (OpenStreetMap)
 * @param address - L'adresse complète à géocoder
 * @returns Les coordonnées lat/lng
 */
export const geocodeAddress = createServerFn({ method: "GET" })
	.inputValidator((address: string) => address)
	.handler(async ({ data: address }) => {
		const response = await fetch(
			`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
			{
				headers: {
					"User-Agent": "Midi-Mealy/1.0",
				},
			},
		);

		if (!response.ok) {
			throw new Error("Erreur lors du géocodage de l'adresse");
		}

		const results = await response.json();

		if (!results || results.length === 0) {
			throw new Error(
				"Adresse non trouvée. Veuillez vérifier l'adresse saisie.",
			);
		}

		return {
			lat: parseFloat(results[0].lat),
			lng: parseFloat(results[0].lon),
		};
	});

/**
 * Crée un nouveau bureau avec géocodage automatique de l'adresse
 * @param data - Les informations du bureau (nom, adresse, etc.)
 * @returns Le bureau créé
 */
export const createOffice = createServerFn({ method: "POST" })
	.inputValidator((data: CreateOfficeInput) => data)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();

		// Vérifier l'authentification
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			throw new Error("Vous devez être connecté pour créer un bureau");
		}

		// Géocoder l'adresse complète
		const fullAddress = `${data.street}, ${data.zip_code} ${data.city}, ${data.country}`;
		const coords = await geocodeAddress({ data: fullAddress });

		// Créer le bureau
		const { data: office, error } = await supabase
			.from("offices")
			.insert({
				name: data.name,
				street: data.street,
				city: data.city,
				zip_code: data.zip_code,
				country: data.country,
				logo_url:
					data.logo_url ||
					"https://cdn-icons-png.freepik.com/512/18214/18214645.png?ga=GA1.1.347094884.1761166313",
				lat: coords.lat,
				lng: coords.lng,
				manager_id: user.id,
			})
			.select()
			.single();

		if (error) {
			throw new Error(`Erreur lors de la création du bureau: ${error.message}`);
		}

		return office;
	});

/**
 * Met à jour un bureau existant (manager uniquement)
 * @param data - L'ID du bureau et les champs à mettre à jour
 * @returns Le bureau mis à jour
 */
export const updateOffice = createServerFn({ method: "POST" })
	.inputValidator(
		(data: { id: number; updates: Partial<CreateOfficeInput> }) => data,
	)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();

		const { data: office, error } = await supabase
			.from("offices")
			.update(data.updates)
			.eq("id", data.id)
			.select()
			.single();

		if (error) {
			throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
		}

		return office;
	});

/**
 * Supprime un bureau avec vérification du mot de passe (manager uniquement)
 * @param data - L'ID du bureau et le mot de passe de l'utilisateur
 */
export const deleteOffice = createServerFn({ method: "POST" })
	.inputValidator((data: { id: number; password: string }) => data)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();

		// Récupérer l'utilisateur connecté
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user || !user.email) {
			throw new Error("Vous devez être connecté pour supprimer un bureau");
		}

		// Vérifier le mot de passe en tentant une ré-authentification
		const { error: authError } = await supabase.auth.signInWithPassword({
			email: user.email,
			password: data.password,
		});

		if (authError) {
			throw new Error("Mot de passe incorrect");
		}

		// Vérifier que l'utilisateur est bien le manager du bureau
		const { data: office } = await supabase
			.from("offices")
			.select("manager_id")
			.eq("id", data.id)
			.single();

		if (!office || office.manager_id !== user.id) {
			throw new Error("Vous n'êtes pas autorisé à supprimer ce bureau");
		}

		// Supprimer le bureau
		const { error } = await supabase.from("offices").delete().eq("id", data.id);

		if (error) {
			throw new Error(`Erreur lors de la suppression: ${error.message}`);
		}

		return { success: true };
	});

export const fetchOfficeById = createServerFn({ method: "GET" })
	.inputValidator((id: number) => id)
	.handler(async ({ data: id }) => {
		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase
			.from("offices")
			.select("*")
			.eq("id", id);
		if (error) {
			throw new Error(error.message);
		}
		return data[0];
	});

/**
 * Récupère un restaurant spécifique depuis le cache OSM par son ID
 * @param data - L'ID du restaurant (format: osm_XXXXX)
 * @returns Le restaurant trouvé ou null
 *
 * @example
 * const restaurant = await fetchOSMRestaurantById({
 *   data: "osm_12345678"
 * });
 */
export const fetchOSMRestaurantById = createServerFn({ method: "GET" })
	.inputValidator((id: string) => id)
	.handler(async ({ data: restaurantId }) => {
		const supabase = getSupabaseServerClient();

		try {
			// Rechercher le restaurant dans le cache
			const { data: cachedData, error: cacheError } = await supabase
				.from("osm_restaurants_cache")
				.select("*")
				.eq("id", restaurantId)
				.gt("expires_at", new Date().toISOString())
				.single();

			if (cacheError || !cachedData) {
				throw new Error("Restaurant non trouvé dans le cache");
			}

			// Convertir les données du cache au format Restaurant
			const restaurant: Restaurant = {
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
 * Récupère les restaurants depuis OpenStreetMap dans une zone donnée avec cache Supabase
 * @param data - Objet contenant lat, lng et optionnellement radius
 * @returns Liste des restaurants trouvés avec leurs informations
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
			await cleanExpiredCache();

			// Validation des paramètres d'entrée
			const { lat, lng, radius = 800 } = data;

			// Validation des valeurs numériques
			if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radius)) {
				throw new Error(
					"Les paramètres 'lat', 'lng' et 'radius' doivent être des nombres valides",
				);
			}

			// Validation des plages de valeurs
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

			// Créer une clé de cache unique basée sur les coordonnées et le rayon
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

				// Convertir les données du cache au format Restaurant
				const restaurants: Restaurant[] = cachedData.map((item) => ({
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

			// Appel à l'API Overpass avec gestion d'erreurs
			const response = await fetch("https://overpass-api.de/api/interpreter", {
				method: "POST",
				body: query,
				headers: {
					"Content-Type": "text/plain",
					"User-Agent": "Midi-Mealy/1.0",
				},
				signal: AbortSignal.timeout(30000), // Timeout de 30 secondes
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Erreur Overpass API:", response.status, errorText);
				throw new Error(
					`Erreur API Overpass: ${response.status} - ${response.statusText}`,
				);
			}

			const osmData = (await response.json()) as OSMResponse;

			// Validation de la réponse
			if (!osmData.elements || !Array.isArray(osmData.elements)) {
				throw new Error("Format de réponse invalide de l'API Overpass");
			}

			// Normalisation et filtrage des données avec limite
			const restaurants: Restaurant[] = osmData.elements
				.filter((element: OSMElement) => {
					// Filtrer les éléments sans nom ou avec des coordonnées invalides
					return (
						element.tags?.name &&
						((element.lat && element.lon) || element.center)
					);
				})
				.slice(0, 1000) // Limiter à 1000 restaurants maximum
				.map((element: OSMElement): Restaurant | null => {
					// Déterminer les coordonnées (node vs way/relation)
					const coords =
						element.lat && element.lon
							? { lat: element.lat, lng: element.lon }
							: element.center
								? { lat: element.center.lat, lng: element.center.lon }
								: null;

					if (!coords || !element.tags?.name) return null;

					// Construction de l'adresse complète
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
				.filter((restaurant): restaurant is Restaurant => restaurant !== null);

			console.log(`Trouvé ${restaurants.length} restaurants dans la zone`);

			// Sauvegarder en cache dans Supabase (TTL de 2 heures)
			if (restaurants.length > 0) {
				const expiresAt = new Date();
				expiresAt.setHours(expiresAt.getHours() + 2); // Cache de 2 heures

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

				// Insérer le nouveau cache
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

			// Gestion des erreurs spécifiques
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

export const joinOffice = createServerFn({ method: "POST" })
	.inputValidator((data: { office_id: number; code?: string }) => {
		if (!data.office_id) {
			throw new Error("L'ID de l'office est requis");
		}
		return data;
	})
	.handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
		const supabase = getSupabaseServerClient();

		// 1. Vérifier l'authentification
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			return {
				success: false,
				error: "Vous devez être connecté pour rejoindre un office",
			};
		}

		// 2. Récupérer l'office
		const { data: office, error: officeError } = await supabase
			.from("offices")
			.select("id, name, join_policy")
			.eq("id", data.office_id)
			.single();

		if (officeError || !office) {
			return {
				success: false,
				error: "Office non trouvé",
			};
		}

		// 3. Vérifier si l'utilisateur est déjà membre
		const { data: existingMember } = await supabase
			.from("office_members")
			.select("id")
			.eq("office_id", data.office_id)
			.eq("user_id", user.id)
			.single();

		if (existingMember) {
			return {
				success: false,
				error: "Vous êtes déjà membre de cet office",
			};
		}

		// 4. Traiter selon la politique d'adhésion
		if (!office.join_policy || office.join_policy === "open") {
			// Office ouvert : adhésion directe
			const { error: insertError } = await supabase
				.from("office_members")
				.insert({
					office_id: data.office_id,
					user_id: user.id,
					role: "member",
				});

			if (insertError) {
				console.error("Erreur lors de l'ajout du membre:", insertError);
				return {
					success: false,
					error: "Erreur lors de l'adhésion à l'office",
				};
			}

			return { success: true };
		}

		if (office.join_policy === "code_required") {
			// Office avec code requis
			if (!data.code) {
				return {
					success: false,
					error: "Un code d'invitation est requis pour rejoindre cet office",
				};
			}

			const normalizedCode = data.code.toUpperCase().trim();

			// Valider le code depuis office_invite_codes
			const { data: inviteCode, error: codeError } = await supabase
				.from("office_invite_codes")
				.select("*")
				.eq("code", normalizedCode)
				.single();

			if (codeError || !inviteCode) {
				return {
					success: false,
					error: "Code d'invitation invalide",
				};
			}

			// Vérifier que le code appartient bien à cet office
			if (inviteCode.office_id !== data.office_id) {
				return {
					success: false,
					error: "Ce code n'est pas valide pour cet office",
				};
			}

			// Vérifier si le code est actif
			if (!inviteCode.is_active) {
				return {
					success: false,
					error: "Ce code d'invitation a été désactivé",
				};
			}

			// Vérifier la date d'expiration
			if (new Date(inviteCode.expires_at) < new Date()) {
				return {
					success: false,
					error: "Ce code d'invitation a expiré",
				};
			}

			// Vérifier le nombre d'utilisations
			if (
				inviteCode.max_uses !== null &&
				inviteCode.uses_count >= inviteCode.max_uses
			) {
				return {
					success: false,
					error: "Ce code a atteint le nombre maximum d'utilisations",
				};
			}

			// Ajouter l'utilisateur comme membre
			const { error: insertError } = await supabase
				.from("office_members")
				.insert({
					office_id: data.office_id,
					user_id: user.id,
					role: "member",
				});

			if (insertError) {
				console.error("Erreur lors de l'ajout du membre:", insertError);
				return {
					success: false,
					error: "Erreur lors de l'adhésion à l'office",
				};
			}

			// Incrémenter le compteur d'utilisations du code via RPC (bypass RLS)
			const { error: updateError } = await supabase.rpc(
				"increment_invite_code_uses",
				{ code_id: inviteCode.id },
			);

			if (updateError) {
				console.error(
					"Erreur lors de l'incrémentation uses_count:",
					updateError,
				);
			}

			return { success: true };
		}

		return {
			success: false,
			error: "Politique d'adhésion non reconnue",
		};
	});
