import { z } from "zod";

/**
 * Shared Zod schemas for server function input validation.
 * Each schema ensures that no malformed or oversized data
 * reaches the backend.
 */

export const UpdateUsernameSchema = z.object({
	username: z
		.string()
		.min(2, "Le nom doit contenir au moins 2 caractères")
		.max(50, "Le nom ne peut pas dépasser 50 caractères"),
});

export const UpdateDisplayOfficeSchema = z.object({
	display_office_id: z.number().nullable(),
});

export const UpdateOfficeSchema = z.object({
	id: z.number(),
	updates: z.object({
		name: z.string().min(1).max(100).optional(),
		street: z.string().max(200).optional(),
		city: z.string().max(100).optional(),
		zip_code: z.string().max(20).optional(),
		country: z.string().max(100).optional(),
		logo_url: z.string().url().optional(),
		join_policy: z.enum(["open", "code_required"]).optional(),
	}),
});

export const JoinOfficeSchema = z.object({
	office_id: z.number({ message: "L'ID de l'office est requis" }),
	code: z.string().optional(),
});

export const DeleteOfficeSchema = z.object({
	id: z.number(),
	password: z.string().min(1, "Le mot de passe est requis"),
});
