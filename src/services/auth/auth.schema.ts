import { z } from "zod";

export const SignUpSchema = z
	.object({
		fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
		email: z.string().email("L'email est invalide"),
		password: z
			.string()
			.min(8)
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre",
			),
		confirmPassword: z
			.string()
			.min(8)
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
	email: z.string().email(),
	password: z.string().min(8),
});

export type SignUpSchema = z.infer<typeof SignUpSchema>;
export type LoginSchema = z.infer<typeof LoginSchema>;
