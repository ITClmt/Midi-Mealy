/**
 * Parse error messages from various formats (string, Zod errors array, etc.)
 * Used by auth forms to display user-friendly error messages.
 *
 * @param message - Raw error message, possibly a JSON-serialized Zod error array
 * @returns A single human-readable error string
 */
export function parseErrorMessage(message: string | undefined): string {
	if (!message) return "Une erreur est survenue";

	// Try to parse as JSON (Zod validation errors come as JSON array)
	try {
		const parsed = JSON.parse(message);
		if (Array.isArray(parsed) && parsed.length > 0) {
			return parsed[0]?.message || message;
		}
	} catch {
		// Not JSON, return as-is
	}

	return message;
}
