import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/db/supabase";
import { SignUpSchema } from "./auth.schema";

export const signUp = createServerFn()
	.inputValidator(SignUpSchema)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { error } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
		});
		if (error) {
			return {
				error: true,
				message: error.message,
			};
		}

		// Redirect to the prev page stored in the "redirect" search param
		throw redirect({
			href: "/",
		});
	});
