import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/db/supabase";
import { geocodeAddress } from "@/services/geocoding/geocoding.api";
import {
	DeleteOfficeSchema,
	JoinOfficeSchema,
	UpdateOfficeSchema,
} from "@/services/schemas";
import type { CreateOfficeInput } from "./offices.types";

export const fetchOffices = createServerFn({ method: "GET" }).handler(
	async () => {
		const supabase = getSupabaseServerClient();

		const { data, error } = await supabase.from("offices").select("*");

		if (error) {
			throw new Error(error.message);
		}
		return data;
	},
);

/**
 * Crée un nouveau bureau avec géocodage automatique de l'adresse.
 * Le créateur devient automatiquement le manager du bureau.
 */
export const createOffice = createServerFn({ method: "POST" })
	.inputValidator((data: CreateOfficeInput) => data)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();

		// Vérifier l'authentification
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			throw new Error("Vous devez être connecté pour créer un bureau");
		}

		// Géocoder l'adresse complète
		const fullAddress = `${data.street}, ${data.zip_code} ${data.city}, ${data.country}`;
		const coords = await geocodeAddress({ data: fullAddress });

		// Créer le bureau
		const { data: office, error } = await supabase
			.from("offices")
			.insert({
				name: data.name,
				street: data.street,
				city: data.city,
				zip_code: data.zip_code,
				country: data.country,
				logo_url:
					data.logo_url ||
					"https://cdn-icons-png.freepik.com/512/18214/18214645.png?ga=GA1.1.347094884.1761166313",
				lat: coords.lat,
				lng: coords.lng,
				manager_id: user.id,
			})
			.select()
			.single();

		if (error) {
			throw new Error(`Erreur lors de la création du bureau: ${error.message}`);
		}

		return office;
	});

/**
 * Met à jour un bureau existant (manager uniquement).
 * Uses Zod validation to ensure data integrity.
 */
export const updateOffice = createServerFn({ method: "POST" })
	.inputValidator(UpdateOfficeSchema)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();

		const { data: office, error } = await supabase
			.from("offices")
			.update(data.updates)
			.eq("id", data.id)
			.select()
			.single();

		if (error) {
			throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
		}

		return office;
	});

/**
 * Supprime un bureau avec vérification du mot de passe (manager uniquement).
 */
export const deleteOffice = createServerFn({ method: "POST" })
	.inputValidator(DeleteOfficeSchema)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();

		// Récupérer l'utilisateur connecté
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user || !user.email) {
			throw new Error("Vous devez être connecté pour supprimer un bureau");
		}

		// Vérifier le mot de passe en tentant une ré-authentification
		const { error: authError } = await supabase.auth.signInWithPassword({
			email: user.email,
			password: data.password,
		});

		if (authError) {
			throw new Error("Mot de passe incorrect");
		}

		// Vérifier que l'utilisateur est bien le manager du bureau
		const { data: office } = await supabase
			.from("offices")
			.select("manager_id")
			.eq("id", data.id)
			.single();

		if (!office || office.manager_id !== user.id) {
			throw new Error("Vous n'êtes pas autorisé à supprimer ce bureau");
		}

		// Supprimer le bureau
		const { error } = await supabase.from("offices").delete().eq("id", data.id);

		if (error) {
			throw new Error(`Erreur lors de la suppression: ${error.message}`);
		}

		return { success: true };
	});

export const fetchOfficeById = createServerFn({ method: "GET" })
	.inputValidator((id: number) => id)
	.handler(async ({ data: id }) => {
		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase
			.from("offices")
			.select("*")
			.eq("id", id);
		if (error) {
			throw new Error(error.message);
		}
		return data[0];
	});

/**
 * Rejoint un office. Gère les deux politiques d'adhésion :
 * - "open" : adhésion directe
 * - "code_required" : nécessite un code d'invitation valide
 */
export const joinOffice = createServerFn({ method: "POST" })
	.inputValidator(JoinOfficeSchema)
	.handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
		const supabase = getSupabaseServerClient();

		// 1. Vérifier l'authentification
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			return {
				success: false,
				error: "Vous devez être connecté pour rejoindre un office",
			};
		}

		// 2. Récupérer l'office
		const { data: office, error: officeError } = await supabase
			.from("offices")
			.select("id, name, join_policy")
			.eq("id", data.office_id)
			.single();

		if (officeError || !office) {
			return {
				success: false,
				error: "Office non trouvé",
			};
		}

		// 3. Vérifier si l'utilisateur est déjà membre
		const { data: existingMember } = await supabase
			.from("office_members")
			.select("id")
			.eq("office_id", data.office_id)
			.eq("user_id", user.id)
			.single();

		if (existingMember) {
			return {
				success: false,
				error: "Vous êtes déjà membre de cet office",
			};
		}

		// 4. Traiter selon la politique d'adhésion
		if (!office.join_policy || office.join_policy === "open") {
			// Office ouvert : adhésion directe
			const { error: insertError } = await supabase
				.from("office_members")
				.insert({
					office_id: data.office_id,
					user_id: user.id,
					role: "member",
				});

			if (insertError) {
				console.error("Erreur lors de l'ajout du membre:", insertError);
				return {
					success: false,
					error: "Erreur lors de l'adhésion à l'office",
				};
			}

			return { success: true };
		}

		if (office.join_policy === "code_required") {
			// Office avec code requis
			if (!data.code) {
				return {
					success: false,
					error: "Un code d'invitation est requis pour rejoindre cet office",
				};
			}

			const normalizedCode = data.code.toUpperCase().trim();

			// Valider le code depuis office_invite_codes
			const { data: inviteCode, error: codeError } = await supabase
				.from("office_invite_codes")
				.select("*")
				.eq("code", normalizedCode)
				.single();

			if (codeError || !inviteCode) {
				return {
					success: false,
					error: "Code d'invitation invalide",
				};
			}

			// Vérifier que le code appartient bien à cet office
			if (inviteCode.office_id !== data.office_id) {
				return {
					success: false,
					error: "Ce code n'est pas valide pour cet office",
				};
			}

			// Vérifier si le code est actif
			if (!inviteCode.is_active) {
				return {
					success: false,
					error: "Ce code d'invitation a été désactivé",
				};
			}

			// Vérifier la date d'expiration
			if (new Date(inviteCode.expires_at) < new Date()) {
				return {
					success: false,
					error: "Ce code d'invitation a expiré",
				};
			}

			// Vérifier le nombre d'utilisations
			if (
				inviteCode.max_uses !== null &&
				inviteCode.uses_count >= inviteCode.max_uses
			) {
				return {
					success: false,
					error: "Ce code a atteint le nombre maximum d'utilisations",
				};
			}

			// Ajouter l'utilisateur comme membre
			const { error: insertError } = await supabase
				.from("office_members")
				.insert({
					office_id: data.office_id,
					user_id: user.id,
					role: "member",
				});

			if (insertError) {
				console.error("Erreur lors de l'ajout du membre:", insertError);
				return {
					success: false,
					error: "Erreur lors de l'adhésion à l'office",
				};
			}

			// Incrémenter le compteur d'utilisations du code via RPC (bypass RLS)
			const { error: updateError } = await supabase.rpc(
				"increment_invite_code_uses",
				{ code_id: inviteCode.id },
			);

			if (updateError) {
				console.error(
					"Erreur lors de l'incrémentation uses_count:",
					updateError,
				);
			}

			return { success: true };
		}

		return {
			success: false,
			error: "Politique d'adhésion non reconnue",
		};
	});
