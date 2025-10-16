import { createClient } from "@supabase/supabase-js";

if (!process.env.VITE_SUPABASE_URL) {
	throw new Error("VITE_SUPABASE_URL environment variable is required");
}

if (!process.env.VITE_SUPABASE_ANON_KEY) {
	throw new Error("VITE_SUPABASE_ANON_KEY environment variable is required");
}

export const supabase = createClient(
	process.env.VITE_SUPABASE_URL,
	process.env.VITE_SUPABASE_ANON_KEY,
);
