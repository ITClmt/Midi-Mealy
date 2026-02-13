import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/db/supabase";
import type { OfficeInviteCode } from "./officeCode";

export const generateInviteCode = createServerFn({ method: "POST" })
	.inputValidator(
		(data: {
			office_id: number;
			expires_at: string;
			max_uses?: number | null;
		}) => {
			if (!data.office_id) {
				throw new Error("L'ID de l'office est requis");
			}
			if (!data.expires_at) {
				throw new Error("La date d'expiration est requise");
			}
			return data;
		},
	)
	.handler(
		async ({
			data,
		}): Promise<{
			success: boolean;
			code?: OfficeInviteCode;
			error?: string;
		}> => {
			const supabase = getSupabaseServerClient();

			// Vérifier que l'utilisateur est connecté
			const { data: userData, error: userError } =
				await supabase.auth.getUser();
			if (userError || !userData.user) {
				return {
					success: false,
					error: "Vous devez être connecté pour générer un code d'invitation",
				};
			}

			// Vérifier si l'utilisateur est le manager de l'office (via offices.manager_id)
			const { data: office } = await supabase
				.from("offices")
				.select("manager_id")
				.eq("id", data.office_id)
				.single();

			const isOfficeManager = office?.manager_id === userData.user.id;

			// Vérifier si l'utilisateur est manager/moderator dans office_members
			const { data: officeMember } = await supabase
				.from("office_members")
				.select("role")
				.eq("user_id", userData.user.id)
				.eq("office_id", data.office_id)
				.single();

			const isMemberWithRole =
				officeMember?.role === "manager" || officeMember?.role === "moderator";

			if (!isOfficeManager && !isMemberWithRole) {
				return {
					success: false,
					error:
						"Vous devez être manager ou modérateur pour générer un code d'invitation",
				};
			}

			// Générer un code unique de 8 caractères
			const generateUniqueCode = (): string => {
				const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclus I, O, 0, 1 pour éviter confusion
				let code = "";
				for (let i = 0; i < 8; i++) {
					code += chars.charAt(Math.floor(Math.random() * chars.length));
				}
				return code;
			};

			const code = generateUniqueCode();

			// Insérer le code dans la base de données
			const { data: inviteCode, error: insertError } = await supabase
				.from("office_invite_codes")
				.insert({
					office_id: data.office_id,
					code: code,
					created_by: userData.user.id,
					expires_at: data.expires_at,
					max_uses: data.max_uses ?? null,
					uses_count: 0,
					is_active: true,
				})
				.select()
				.single();

			if (insertError) {
				console.error("Erreur lors de la création du code:", insertError);

				// Si le code existe déjà (très rare), réessayer avec un nouveau code
				if (insertError.code === "23505") {
					return generateInviteCode({ data });
				}

				return {
					success: false,
					error:
						insertError.message ||
						"Erreur lors de la création du code d'invitation",
				};
			}

			return {
				success: true,
				code: inviteCode as OfficeInviteCode,
			};
		},
	);

/**
 * Récupère tous les codes d'invitation d'un office
 */
export const getInviteCodes = createServerFn({ method: "GET" })
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
			success: boolean;
			codes?: OfficeInviteCode[];
			error?: string;
		}> => {
			const supabase = getSupabaseServerClient();

			const { data: codes, error } = await supabase
				.from("office_invite_codes")
				.select("*")
				.eq("office_id", data.office_id)
				.order("created_at", { ascending: false });

			if (error) {
				return {
					success: false,
					error: error.message,
				};
			}

			return {
				success: true,
				codes: codes as OfficeInviteCode[],
			};
		},
	);

/**
 * Désactive un code d'invitation
 */
export const revokeInviteCode = createServerFn({ method: "POST" })
	.inputValidator((data: { code_id: string }) => {
		if (!data.code_id) {
			throw new Error("L'ID du code est requis");
		}
		return data;
	})
	.handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
		const supabase = getSupabaseServerClient();

		const { error } = await supabase.rpc("revoke_invite_code", {
			code_id: data.code_id,
		});

		if (error) {
			return {
				success: false,
				error: error.message,
			};
		}

		return { success: true };
	});

/**
 * Réactive un code d'invitation désactivé
 */
export const reactivateInviteCode = createServerFn({ method: "POST" })
	.inputValidator((data: { code_id: string }) => {
		if (!data.code_id) {
			throw new Error("L'ID du code est requis");
		}
		return data;
	})
	.handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
		const supabase = getSupabaseServerClient();

		const { error } = await supabase.rpc("reactivate_invite_code", {
			code_id: data.code_id,
		});

		if (error) {
			return {
				success: false,
				error: error.message,
			};
		}

		return { success: true };
	});

/**
 * Valide un code d'invitation et retourne les infos de l'office
 */
export const validateInviteCode = createServerFn({ method: "POST" })
	.inputValidator((data: { code: string }) => {
		if (!data.code) {
			throw new Error("Le code est requis");
		}
		return data;
	})
	.handler(
		async ({
			data,
		}): Promise<{
			success: boolean;
			valid?: boolean;
			office_id?: number;
			error?: string;
			reason?: string;
		}> => {
			const supabase = getSupabaseServerClient();

			// Récupérer le code
			const { data: inviteCode, error } = await supabase
				.from("office_invite_codes")
				.select("*")
				.eq("code", data.code.toUpperCase().trim())
				.single();

			if (error || !inviteCode) {
				return {
					success: true,
					valid: false,
					reason: "Code invalide ou inexistant",
				};
			}

			// Vérifier si le code est actif
			if (!inviteCode.is_active) {
				return {
					success: true,
					valid: false,
					reason: "Ce code a été désactivé",
				};
			}

			// Vérifier la date d'expiration
			if (new Date(inviteCode.expires_at) < new Date()) {
				return {
					success: true,
					valid: false,
					reason: "Ce code a expiré",
				};
			}

			// Vérifier le nombre d'utilisations
			if (
				inviteCode.max_uses !== null &&
				inviteCode.uses_count >= inviteCode.max_uses
			) {
				return {
					success: true,
					valid: false,
					reason: "Ce code a atteint le nombre maximum d'utilisations",
				};
			}

			return {
				success: true,
				valid: true,
				office_id: inviteCode.office_id,
			};
		},
	);

export const deleteInviteCode = createServerFn({ method: "POST" })
	.inputValidator((data: { code_id: string }) => {
		if (!data.code_id) {
			throw new Error("L'ID du code est requis");
		}
		return data;
	})
	.handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
		const supabase = getSupabaseServerClient();

		const { error } = await supabase.rpc("delete_invite_code", {
			code_id: data.code_id,
		});

		if (error) {
			return {
				success: false,
				error: error.message,
			};
		}

		return { success: true };
	});
