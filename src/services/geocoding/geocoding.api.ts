import { createServerFn } from "@tanstack/react-start";

/**
 * Géocode une adresse via l'API Nominatim (OpenStreetMap).
 *
 * Why Nominatim? It's free, no API key needed, and sufficient for our
 * use case (geocoding office addresses on creation). For production
 * scale, consider MapBox or Google Geocoding API.
 *
 * @see https://nominatim.org/release-docs/develop/api/Search/
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
