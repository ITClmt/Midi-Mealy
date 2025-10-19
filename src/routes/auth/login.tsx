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
import { getSupabaseServerClient } from "@/lib/db/supabase";

export const Route = createFileRoute("/auth/login")({
	component: LoginForm,
});

const schema = z.object({
	email: z.string().email("L'email est invalide"),
	password: z
		.string()
		.min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

function LoginForm() {
	const navigate = useNavigate();
	const form = useAppForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onBlur: schema,
		},
		onSubmit: ({ value }) => {
			getSupabaseServerClient()
				.auth.signInWithPassword({
					email: value.email,
					password: value.password,
				})
				.then(({ error }) => {
					if (error) {
						console.error(error);
					} else {
						navigate({ to: "/" });
					}
				});
		},
	});

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<Card className="shadow-lg border-0">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-2xl font-bold text-slate-900">
							Connexion
						</CardTitle>
						<CardDescription className="text-slate-600">
							Connectez-vous à votre compte
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
							<form.AppField name="email">
								{(field) => (
									<field.TextField
										label="Email"
										placeholder="email@example.com"
										type="email"
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

							<div className="pt-4">
								<form.AppForm>
									<Button type="submit" className="w-full" size="lg">
										Se connecter
									</Button>
								</form.AppForm>
							</div>
						</form>
					</CardContent>
					<CardContent className="pt-0">
						<div className="text-center">
							<p className="text-sm text-slate-600">
								Pas encore de compte ?{" "}
								<Link
									to="/auth/signup"
									className="text-blue-600 hover:text-blue-500 font-medium"
								>
									Créer un compte
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
