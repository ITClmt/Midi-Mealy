import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
	throw new Error("VITE_SUPABASE_URL environment variable is required");
}

if (!supabaseAnonKey) {
	throw new Error("VITE_SUPABASE_ANON_KEY environment variable is required");
}

export function getSupabaseServerClient() {
	return createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return Object.entries(getCookies()).map(([name, value]) => ({
					name,
					value,
				}));
			},
			setAll(cookies) {
				cookies.forEach((cookie) => {
					setCookie(cookie.name, cookie.value);
				});
			},
		},
	});
}
