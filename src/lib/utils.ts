import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Normalise une chaîne de caractères en supprimant les accents et diacritiques
 * Utile pour la recherche fuzzy (ex: "Sürpriz" match "Surpriz")
 */
export function normalizeText(text: string): string {
	return text
		.normalize("NFD") // Décompose les caractères accentués (é → e + ́)
		.replace(/[\u0300-\u036f]/g, "") // Supprime les diacritiques
		.toLowerCase();
}
