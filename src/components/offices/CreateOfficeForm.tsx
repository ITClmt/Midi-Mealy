import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Building2, Loader2, MapPin } from "lucide-react";
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
import { createOffice } from "@/services/offices/offices.api";
import type { CreateOfficeInput } from "@/services/offices/offices.types";

interface CreateOfficeFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
}

export function CreateOfficeForm({
	onSuccess,
	onCancel,
}: CreateOfficeFormProps) {
	const queryClient = useQueryClient();
	const router = useRouter();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const createOfficeMutation = useMutation({
		mutationFn: (data: CreateOfficeInput) => createOffice({ data }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["offices"] });
			router.invalidate();
			onSuccess?.();
		},
		onError: (error: Error) => {
			setErrorMessage(error.message);
		},
	});

	const form = useAppForm({
		defaultValues: {
			name: "",
			street: "",
			city: "",
			zip_code: "",
			country: "France",
			logo_url: "",
		} as CreateOfficeInput,
		onSubmit: async ({ value }) => {
			setErrorMessage(null);
			await createOfficeMutation.mutateAsync(value);
		},
	});

	return (
		<div className="bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-lg">
				<Card className="border shadow-sm">
					<CardHeader className="space-y-1 text-center">
						<div className="flex justify-center mb-2">
							<div className="p-3 bg-primary/10 rounded-xl text-primary">
								<Building2 className="w-8 h-8" />
							</div>
						</div>
						<CardTitle className="text-2xl font-bold">
							Créer un bureau
						</CardTitle>
						<CardDescription>
							Ajoutez votre bureau pour trouver des restaurants à proximité
						</CardDescription>
					</CardHeader>
					<CardContent>
						{errorMessage && (
							<div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
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
							<form.AppField name="name">
								{(field) => (
									<field.TextField
										label="Nom du bureau"
										placeholder="Mon entreprise - Bureau Paris"
									/>
								)}
							</form.AppField>

							<div className="border-t pt-4 mt-4">
								<div className="flex items-center gap-2 mb-4 text-muted-foreground">
									<MapPin className="w-4 h-4" />
									<span className="text-sm font-medium">Adresse du bureau</span>
								</div>

								<form.AppField name="street">
									{(field) => (
										<field.TextField
											label="Rue"
											placeholder="10 rue de Rivoli"
										/>
									)}
								</form.AppField>

								<div className="grid grid-cols-2 gap-4 mt-4">
									<form.AppField name="zip_code">
										{(field) => (
											<field.TextField
												label="Code postal"
												placeholder="75001"
											/>
										)}
									</form.AppField>

									<form.AppField name="city">
										{(field) => (
											<field.TextField label="Ville" placeholder="Paris" />
										)}
									</form.AppField>
								</div>

								<div className="mt-4">
									<form.AppField name="country">
										{(field) => (
											<field.TextField label="Pays" placeholder="France" />
										)}
									</form.AppField>
								</div>
							</div>

							<form.AppField name="logo_url">
								{(field) => (
									<field.TextField
										label="URL du logo (optionnel)"
										placeholder="https://example.com/logo.png"
									/>
								)}
							</form.AppField>

							<div className="flex gap-3 pt-4">
								{onCancel && (
									<Button
										type="button"
										variant="outline"
										className="flex-1"
										onClick={onCancel}
									>
										Annuler
									</Button>
								)}
								<form.AppForm>
									<Button
										type="submit"
										className="flex-1"
										size="lg"
										disabled={createOfficeMutation.isPending}
									>
										{createOfficeMutation.isPending ? (
											<>
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												Création...
											</>
										) : (
											"Créer le bureau"
										)}
									</Button>
								</form.AppForm>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
