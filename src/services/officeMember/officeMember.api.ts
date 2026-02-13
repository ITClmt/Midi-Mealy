import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/db/supabase";

export interface OfficeMember {
	id: string;
	office_id: number;
	user_id: string;
	role: "manager" | "moderator" | "member";
	joined_at: string;
}

/**
 * Récupère le statut de membre de l'utilisateur courant pour un office
 */
export const getMembershipStatus = createServerFn({ method: "GET" })
	.inputValidator((data: { office_id: number }) => {
		if (!data.office_id) {
			throw new Error("L'ID de l'office est requis");
		}
		return data;
	})
	.handler(
		async ({
			data,
		}): Promise<{
			isMember: boolean;
			member?: OfficeMember;
			error?: string;
		}> => {
			const supabase = getSupabaseServerClient();

			// Vérifier l'authentification
			const { data: userData, error: userError } =
				await supabase.auth.getUser();
			if (userError || !userData.user) {
				return { isMember: false };
			}

			// Chercher le membre
			const { data: member, error } = await supabase
				.from("office_members")
				.select("*")
				.eq("office_id", data.office_id)
				.eq("user_id", userData.user.id)
				.single();

			if (error || !member) {
				return { isMember: false };
			}

			return {
				isMember: true,
				member: member as OfficeMember,
			};
		},
	);

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

export const leaveOffice = createServerFn({ method: "POST" })
	.inputValidator((data: { member_id: string }) => {
		if (!data.member_id) {
			throw new Error("L'ID du membre est requis");
		}
		return data;
	})
	.handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
		const supabase = getSupabaseServerClient();

		const { error } = await supabase
			.from("office_members")
			.delete()
			.eq("id", data.member_id);

		if (error) {
			return {
				success: false,
				error: error.message,
			};
		}

		return { success: true };
	});

/**
 * Récupère les offices dont l'utilisateur courant est membre
 */
export const getUserOffices = createServerFn({ method: "GET" })
	.inputValidator((data: unknown) => data)
	.handler(async () => {
		const supabase = getSupabaseServerClient();

		const { data: userData, error: userError } = await supabase.auth.getUser();
		if (userError || !userData.user) {
			return { offices: [] };
		}

		// Offices where user is a member
		const { data: memberships } = await supabase
			.from("office_members")
			.select("office_id")
			.eq("user_id", userData.user.id);

		// Offices where user is the manager (creator)
		const { data: managedOffices } = await supabase
			.from("offices")
			.select("id, name")
			.eq("manager_id", userData.user.id);

		const managedIds = new Set(
			(managedOffices || []).map((o: { id: number }) => o.id),
		);
		const memberOfficeIds = (memberships || [])
			.map((m: { office_id: number }) => m.office_id)
			.filter((id: number) => !managedIds.has(id));

		let memberOffices: { id: number; name: string }[] = [];
		if (memberOfficeIds.length > 0) {
			const { data: offices } = await supabase
				.from("offices")
				.select("id, name")
				.in("id", memberOfficeIds);
			memberOffices = (offices || []) as { id: number; name: string }[];
		}

		const allOffices = [
			...(managedOffices || []).map((o: { id: number; name: string }) => ({
				id: o.id,
				name: o.name,
			})),
			...memberOffices,
		];

		return { offices: allOffices };
	});
