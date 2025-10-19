import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAppForm } from "@/hooks/form";
import { supabase } from "@/lib/db/supabase";

export const Route = createFileRoute("/auth/signup")({
	component: SignupForm,
});

const schema = z
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
			.min(8, "Le mot de passe doit contenir au moins 8 caractères"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Les mots de passe ne correspondent pas",
	});

function SignupForm() {
	const navigate = useNavigate();
	const form = useAppForm({
		defaultValues: {
			fullName: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		validators: {
			onBlur: schema,
		},
		onSubmit: async ({ value }) => {
			try {
				const { data, error } = await supabase.auth.signUp({
					email: value.email,
					password: value.password,
					options: {
						data: {
							full_name: value.fullName,
						},
					},
				});

				if (error) {
					console.error("Erreur lors de l'inscription:", error.message);
					alert(`Erreur: ${error.message}`);
				} else {
					console.log("Inscription réussie:", data);
					alert(
						"Inscription réussie ! Vérifiez votre email pour confirmer votre compte.",
					);
					navigate({ to: "/auth/login" });
				}
			} catch (error) {
				console.error("Erreur inattendue:", error);
				alert("Une erreur inattendue s'est produite.");
			}
		},
	});

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<Card className="shadow-lg border-0">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-2xl font-bold text-slate-900">
							Créer un compte
						</CardTitle>
						<CardDescription className="text-slate-600">
							Rejoignez-nous dès aujourd'hui
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								form.handleSubmit();
							}}
							className="space-y-4"
						>
							<form.AppField name="fullName">
								{(field) => (
									<field.TextField label="Nom complet" placeholder="John Doe" />
								)}
							</form.AppField>

							<form.AppField name="email">
								{(field) => (
									<field.TextField
										label="Email"
										placeholder="email@example.com"
									/>
								)}
							</form.AppField>

							<form.AppField name="password">
								{(field) => (
									<field.TextField
										label="Mot de passe"
										placeholder="********"
										type="password"
									/>
								)}
							</form.AppField>

							<form.AppField name="confirmPassword">
								{(field) => (
									<field.TextField
										label="Confirmation du mot de passe"
										placeholder="********"
										type="password"
									/>
								)}
							</form.AppField>

							<div className="pt-4">
								<form.AppForm>
									<Button type="submit" className="w-full" size="lg">
										Créer mon compte
									</Button>
								</form.AppForm>
							</div>
						</form>
					</CardContent>
					<CardContent className="pt-0">
						<div className="text-center">
							<p className="text-sm text-slate-600">
								Déjà un compte ?{" "}
								<Link
									to="/auth/login"
									className="text-blue-600 hover:text-blue-500 font-medium"
								>
									Se connecter
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
