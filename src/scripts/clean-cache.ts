/**
 * Script de nettoyage du cache des restaurants OSM
 * À exécuter périodiquement pour nettoyer les données expirées
 */

import { getSupabaseServerClient } from "@/lib/db/supabase";

export const cleanExpiredCache = async () => {
	try {
		const supabase = getSupabaseServerClient();

		// Supprimer tous les enregistrements expirés
		const { data, error } = await supabase
			.from("osm_restaurants_cache")
			.delete()
			.lt("expires_at", new Date().toISOString())
			.select();

		if (error) {
			console.error("Erreur lors du nettoyage du cache:", error);
			return { success: false, error: error.message };
		}

		console.log(
			`Cache nettoyé: ${data?.length || 0} enregistrements expirés supprimés`,
		);
		return { success: true, deletedCount: data?.length || 0 };
	} catch (error) {
		console.error("Erreur lors du nettoyage du cache:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Erreur inconnue",
		};
	}
};

// Fonction pour obtenir les statistiques du cache
export const getCacheStats = async () => {
	try {
		const supabase = getSupabaseServerClient();

		// Compter les enregistrements valides
		const { count: validCount, error: validError } = await supabase
			.from("osm_restaurants_cache")
			.select("*", { count: "exact", head: true })
			.gt("expires_at", new Date().toISOString());

		// Compter les enregistrements expirés
		const { count: expiredCount, error: expiredError } = await supabase
			.from("osm_restaurants_cache")
			.select("*", { count: "exact", head: true })
			.lt("expires_at", new Date().toISOString());

		if (validError || expiredError) {
			throw new Error("Erreur lors de la récupération des statistiques");
		}

		return {
			valid: validCount || 0,
			expired: expiredCount || 0,
			total: (validCount || 0) + (expiredCount || 0),
		};
	} catch (error) {
		console.error("Erreur lors de la récupération des statistiques:", error);
		return null;
	}
};
