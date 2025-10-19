import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
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

export const Route = createFileRoute("/auth/signup")({
	component: SignUpForm,
});

export default function SignUpForm() {
	const queryClient = useQueryClient();
	const router = useRouter();

	const signUpMutation = useMutation({
		mutationFn: (data: Parameters<typeof signUp>[0]) => signUp(data),
		retry: 3,
		retryDelay: 1000,
		onSuccess: () => {
			console.log("signed up successfully");

			queryClient.resetQueries();
			router.invalidate();
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
			await signUpMutation.mutateAsync({ data: value });
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
