import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/db/supabase";

export const updateMemberRole = createServerFn({ method: "POST" })
	.inputValidator((data: { member_id: string; role: string }) => {
		if (!data.member_id) {
			throw new Error("L'ID du membre est requis");
		}
		if (!data.role) {
			throw new Error("Le rôle est requis");
		}
		return data;
	})
	.handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
		const supabase = getSupabaseServerClient();

		const { error } = await supabase
			.from("office_members")
			.update({ role: data.role })
			.eq("id", data.member_id);

		if (error) {
			return {
				success: false,
				error: error.message,
			};
		}

		return { success: true };
	});
