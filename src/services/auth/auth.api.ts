import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/db/supabase";
import { LoginSchema, SignUpSchema } from "./auth.schema";

export const signUp = createServerFn()
	.inputValidator(SignUpSchema)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { error, data: userData } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
		});

		if (error) {
			return {
				error: true,
				message: error.message,
			};
		}

		if (userData.user) {
			return {
				user: userData.user,
				session: userData.session,
			};
		}
		// Redirect to the prev page stored in the "redirect" search param
		throw redirect({
			href: "/",
		});
	});

export const login = createServerFn()
	.inputValidator(LoginSchema)
	.handler(async ({ data }) => {
		const { error } = await getSupabaseServerClient().auth.signInWithPassword({
			email: data.email,
			password: data.password,
		});

		if (error) {
			return {
				error: true,
				message: error.message,
			};
		}
	});

export const signOut = createServerFn().handler(async () => {
	await getSupabaseServerClient().auth.signOut();
	return {
		success: true,
		message: "Déconnexion réussie",
	};
});

export const getUser = createServerFn().handler(async () => {
	const supabase = getSupabaseServerClient();

	const { data } = await supabase.auth.getUser();

	if (!data.user) {
		return { isAuthenticated: false };
	}

	return {
		isAuthenticated: true,
		user: {
			email: data.user.email,
			meta: { username: data.user.user_metadata.name },
		},
	};
});
