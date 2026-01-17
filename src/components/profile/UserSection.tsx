import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Check, Loader2, User2Icon } from "lucide-react";
import { useId, useState } from "react";
import { useAppForm } from "@/hooks/form";
import { updateUsername } from "@/services/auth/auth.api";
import type { User } from "@/services/auth/auth.schema";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export const UserSection = ({ user }: { user: User }) => {
	const queryClient = useQueryClient();
	const router = useRouter();
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const emailInputId = useId();

	const updateMutation = useMutation({
		mutationFn: (username: string) => updateUsername({ data: { username } }),
		onSuccess: () => {
			setSuccessMessage("Nom d'utilisateur mis à jour !");
			setErrorMessage(null);
			queryClient.invalidateQueries();
			router.invalidate();
			setTimeout(() => setSuccessMessage(null), 3000);
		},
		onError: (error: Error) => {
			setErrorMessage(error.message);
			setSuccessMessage(null);
		},
	});

	const form = useAppForm({
		defaultValues: {
			username: user.meta.username || "",
		},
		onSubmit: async ({ value }) => {
			await updateMutation.mutateAsync(value.username);
		},
	});

	return (
		<section>
			<div className="flex flex-col gap-2">
				<h2 className="text-2xl font-bold">Profil</h2>
				<p className="text-muted-foreground">Gère ton profil</p>
			</div>
			<div className="flex flex-col gap-4 border border-border rounded-md p-4 w-full md:w-1/2 lg:w-1/3 mt-4">
				<div className="flex items-center gap-2">
					<User2Icon className="w-4 h-4" />
					<h2 className="text-xl font-bold">Informations</h2>
				</div>

				{successMessage && (
					<div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
						<Check className="w-4 h-4" />
						{successMessage}
					</div>
				)}

				{errorMessage && (
					<div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
						{errorMessage}
					</div>
				)}

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.AppField name="username">
						{(field) => (
							<field.TextField
								label="Nom d'utilisateur"
								placeholder="John Doe"
							/>
						)}
					</form.AppField>

					<form.AppForm>
						<Button type="submit" disabled={updateMutation.isPending}>
							{updateMutation.isPending ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Mise à jour...
								</>
							) : (
								"Mettre à jour"
							)}
						</Button>
					</form.AppForm>
				</form>

				{/* Email (disabled) */}
				<div className="pt-4 border-t">
					<Label htmlFor={emailInputId} className="mb-2 text-xl font-medium">
						Email
					</Label>
					<Input
						id={emailInputId}
						type="email"
						value={user.email || ""}
						disabled
						className="bg-muted cursor-not-allowed"
					/>
					<p className="text-xs text-muted-foreground mt-1">
						L'email ne peut pas être modifié pour le moment.
					</p>
				</div>
			</div>
		</section>
	);
};
