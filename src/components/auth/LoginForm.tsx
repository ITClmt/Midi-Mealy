import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAppForm } from "@/hooks/form";
import { login } from "@/services/auth/auth.api";
import type { LoginSchema } from "@/services/auth/auth.schema";

interface LoginFormProps {
	onToggleMode?: () => void;
	showToggle?: boolean;
}

export function LoginForm({ onToggleMode, showToggle = true }: LoginFormProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [formError, setFormError] = useState<string | null>(null);

	const parseErrorMessage = (message: string | undefined): string => {
		if (!message) return "Une erreur est survenue";

		try {
			const parsed = JSON.parse(message);
			if (Array.isArray(parsed) && parsed.length > 0) {
				return parsed[0]?.message || message;
			}
		} catch {}

		return message;
	};

	const loginMutation = useMutation({
		mutationFn: (data: Parameters<typeof login>[0]) => login(data),
		onSuccess: (response) => {
			if (response?.error) {
				setFormError(parseErrorMessage(response.message));
				return;
			}

			setFormError(null);
			queryClient.resetQueries();
			navigate({ to: "/offices" });
		},
		onError: (error) => {
			setFormError(parseErrorMessage(error.message));
		},
	});

	const form = useAppForm({
		defaultValues: {
			email: import.meta.env.VITE_DEFAULT_USER_EMAIL ?? "",
			password: import.meta.env.VITE_DEFAULT_USER_PASSWORD ?? "",
		} as LoginSchema,
		onSubmit: async ({ value }) => {
			setFormError(null);
			await loginMutation.mutateAsync({ data: value });
		},
	});

	return (
		<div className="bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<Card className="border shadow-sm">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-2xl font-bold">Connexion</CardTitle>
						<CardDescription>Connectez-vous à votre compte</CardDescription>
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
							{formError && (
								<div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
									<AlertCircle className="w-4 h-4 shrink-0" />
									<span>{formError}</span>
								</div>
							)}

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
					{showToggle && (
						<CardContent className="pt-0">
							<div className="text-center">
								<p className="text-sm text-muted-foreground">
									Pas encore de compte ?{" "}
									<button
										type="button"
										onClick={onToggleMode}
										className="text-primary hover:underline font-medium"
									>
										Créer un compte
									</button>
								</p>
							</div>
						</CardContent>
					)}
				</Card>
			</div>
		</div>
	);
}
