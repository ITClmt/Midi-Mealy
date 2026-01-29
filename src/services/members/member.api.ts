import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/db/supabase";
import type { OfficeInviteCode } from "./members.types";

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

		const { error } = await supabase
			.from("office_invite_codes")
			.update({ is_active: false })
			.eq("id", data.code_id);

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

/**
 * Utilise un code d'invitation pour rejoindre un office
 */
export const useInviteCode = createServerFn({ method: "POST" })
	.inputValidator((data: { code: string }) => {
		if (!data.code) {
			throw new Error("Le code est requis");
		}
		return data;
	})
	.handler(
		async ({
			data,
		}): Promise<{ success: boolean; office_id?: number; error?: string }> => {
			const supabase = getSupabaseServerClient();

			// Vérifier l'authentification
			const { data: userData, error: userError } =
				await supabase.auth.getUser();
			if (userError || !userData.user) {
				return {
					success: false,
					error: "Vous devez être connecté pour utiliser un code d'invitation",
				};
			}

			// Valider le code
			const validation = await validateInviteCode({
				data: { code: data.code },
			});
			if (!validation.valid || !validation.office_id) {
				return {
					success: false,
					error: validation.reason || "Code invalide",
				};
			}

			const officeId = validation.office_id;

			// Vérifier si l'utilisateur est déjà membre
			const { data: existingMember } = await supabase
				.from("office_members")
				.select("id")
				.eq("office_id", officeId)
				.eq("user_id", userData.user.id)
				.single();

			if (existingMember) {
				return {
					success: false,
					error: "Vous êtes déjà membre de cet office",
				};
			}

			// Ajouter l'utilisateur comme membre
			const { error: memberError } = await supabase
				.from("office_members")
				.insert({
					office_id: officeId,
					user_id: userData.user.id,
					role: "member",
				});

			if (memberError) {
				return {
					success: false,
					error: memberError.message,
				};
			}

			// Incrémenter le compteur d'utilisations du code
			await supabase.rpc("increment_invite_code_uses", {
				code_value: data.code.toUpperCase().trim(),
			});

			// Alternative si la fonction RPC n'existe pas : mise à jour directe
			// Récupérer le code actuel et incrémenter
			const { data: codeData } = await supabase
				.from("office_invite_codes")
				.select("uses_count")
				.eq("code", data.code.toUpperCase().trim())
				.single();

			if (codeData) {
				await supabase
					.from("office_invite_codes")
					.update({ uses_count: codeData.uses_count + 1 })
					.eq("code", data.code.toUpperCase().trim());
			}

			return {
				success: true,
				office_id: officeId,
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

		const { error } = await supabase
			.from("office_invite_codes")
			.delete()
			.eq("id", data.code_id);

		if (error) {
			return {
				success: false,
				error: error.message,
			};
		}

		return { success: true };
	});
