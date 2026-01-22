import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
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
import { signUp } from "@/services/auth/auth.api";
import type { SignUpSchema } from "@/services/auth/auth.schema";

interface SignUpFormProps {
	onToggleMode?: () => void;
	showToggle?: boolean;
}

export function SignUpForm({
	onToggleMode,
	showToggle = true,
}: SignUpFormProps) {
	const queryClient = useQueryClient();
	const router = useRouter();
	const [formError, setFormError] = useState<string | null>(null);

	// Parse error message from various formats (string, Zod errors array, etc.)
	const parseErrorMessage = (message: string | undefined): string => {
		if (!message) return "Une erreur est survenue";

		// Try to parse as JSON (Zod validation errors come as JSON array)
		try {
			const parsed = JSON.parse(message);
			if (Array.isArray(parsed) && parsed.length > 0) {
				// Extract first error message from Zod errors
				return parsed[0]?.message || message;
			}
		} catch {
			// Not JSON, return as-is
		}

		return message;
	};

	const signUpMutation = useMutation({
		mutationFn: (data: Parameters<typeof signUp>[0]) => signUp(data),
		onSuccess: async (response) => {
			if (response?.error) {
				setFormError(parseErrorMessage(response.message));
				return;
			}

			setFormError(null);
			await queryClient.invalidateQueries();
			await router.invalidate();
			router.navigate({ to: "/offices" });
		},
		onError: (error) => {
			setFormError(parseErrorMessage(error.message));
		},
	});

	const form = useAppForm({
		defaultValues: {
			fullName: "",
			email: "",
			password: "",
			confirmPassword: "",
		} as SignUpSchema,
		onSubmit: async ({ value }) => {
			setFormError(null);
			await signUpMutation.mutateAsync({ data: value });
		},
	});

	return (
		<div className="bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<Card className="border shadow-sm">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-2xl font-bold">
							Créer un compte
						</CardTitle>
						<CardDescription>Rejoignez-nous dès aujourd'hui</CardDescription>
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
					{showToggle && (
						<CardContent className="pt-0">
							<div className="text-center">
								<p className="text-sm text-muted-foreground">
									Déjà un compte ?{" "}
									<button
										type="button"
										onClick={onToggleMode}
										className="text-primary hover:underline font-medium"
									>
										Se connecter
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
