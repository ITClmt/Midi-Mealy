import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
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

export const Route = createFileRoute("/auth/login")({
	component: LoginForm,
	beforeLoad: async ({ context }) => {
		const { authState } = context;
		if (authState.isAuthenticated) {
			throw redirect({ to: "/" });
		}
	},
});

function LoginForm() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const loginMutation = useMutation({
		mutationFn: (data: Parameters<typeof login>[0]) => login(data),
		onSuccess: (response) => {
			if (response?.error) {
				console.error(response.message);
				return;
			}

			queryClient.resetQueries();
			navigate({ to: "/" });
		},
	});

	const form = useAppForm({
		defaultValues: {
			email: import.meta.env.VITE_DEFAULT_USER_EMAIL ?? "",
			password: import.meta.env.VITE_DEFAULT_USER_PASSWORD ?? "",
		} as LoginSchema,
		onSubmit: async ({ value }) => {
			await loginMutation.mutateAsync({ data: value });
		},
	});

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
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
							<p className="text-sm text-muted-foreground">
								Pas encore de compte ?{" "}
								<Link
									to="/auth/signup"
									className="text-primary hover:underline font-medium"
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
