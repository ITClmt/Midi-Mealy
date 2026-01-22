import { z } from "zod";

export const SignUpSchema = z
	.object({
		fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
		email: z.string().email("L'email est invalide"),
		password: z
			.string()
			.min(8, "Le mot de passe doit contenir au moins 8 caractères")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre",
			),
		confirmPassword: z
			.string()
			.min(8, "Le mot de passe doit contenir au moins 8 caractères")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre",
			),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Les mots de passe ne correspondent pas",
	});

export const LoginSchema = z.object({
	email: z.string().email("L'email est invalide"),
	password: z
		.string()
		.min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const UserMetaSchema = z.object({
	username: z.string().min(3).max(20),
});

export type UserMeta = z.infer<typeof UserMetaSchema>;

export type AuthState =
	| {
			isAuthenticated: false;
	  }
	| {
			isAuthenticated: true;
			user: User;
	  };

export type User = { email?: string; meta: UserMeta; id: string };
export type SignUpSchema = z.infer<typeof SignUpSchema>;
export type LoginSchema = z.infer<typeof LoginSchema>;
