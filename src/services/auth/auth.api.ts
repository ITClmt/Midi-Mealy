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
			options: {
				data: {
					name: data.fullName,
				},
			},
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
			meta: {
				username: data.user.user_metadata.name,
				display_office_id: data.user.user_metadata.display_office_id,
			},
			id: data.user.id,
		},
	};
});

/**
 * Met à jour le nom d'utilisateur
 */
export const updateUsername = createServerFn({ method: "POST" })
	.inputValidator((data: { username: string }) => data)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();

		const { error } = await supabase.auth.updateUser({
			data: { name: data.username },
		});

		if (error) {
			throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
		}

		return { success: true, username: data.username };
	});

/**
 * Met à jour l'office affiché dans le profil
 */
export const updateDisplayOffice = createServerFn({ method: "POST" })
	.inputValidator((data: { display_office_id: number | null }) => data)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();

		const { error } = await supabase.auth.updateUser({
			data: { display_office_id: data.display_office_id },
		});

		if (error) {
			throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
		}

		return { success: true };
	});
