import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteOffice } from "@/services/offices/offices.api";
import type { Office } from "@/services/offices/offices.types";

interface DeleteOfficeDialogProps {
	office: Office;
	onSuccess?: () => void;
	onCancel?: () => void;
}

export function DeleteOfficeDialog({
	office,
	onSuccess,
	onCancel,
}: DeleteOfficeDialogProps) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const passwordInputId = useId();

	const deleteOfficeMutation = useMutation({
		mutationFn: () =>
			deleteOffice({ data: { id: Number(office.id), password } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["offices"] });
			onSuccess?.();
			navigate({ to: "/offices" });
		},
		onError: (error: Error) => {
			setErrorMessage(error.message);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage(null);

		if (!password.trim()) {
			setErrorMessage("Veuillez entrer votre mot de passe");
			return;
		}

		deleteOfficeMutation.mutate();
	};

	return (
		<div className="bg-background flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<Card className="border border-destructive/20 shadow-sm">
					<CardHeader className="space-y-1 text-center">
						<div className="flex justify-center mb-2">
							<div className="p-3 bg-destructive/10 rounded-xl text-destructive">
								<AlertTriangle className="w-8 h-8" />
							</div>
						</div>
						<CardTitle className="text-2xl font-bold text-destructive">
							Supprimer le bureau
						</CardTitle>
						<CardDescription>
							Cette action est irréversible. Toutes les données associées seront
							supprimées.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="mb-6 p-4 bg-muted rounded-lg">
							<p className="text-sm text-muted-foreground">
								Vous êtes sur le point de supprimer :
							</p>
							<p className="font-semibold mt-1">{office.name}</p>
							<p className="text-sm text-muted-foreground">
								{office.street}, {office.zip_code} {office.city}
							</p>
						</div>

						{errorMessage && (
							<div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
								{errorMessage}
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<Label
									htmlFor={passwordInputId}
									className="mb-2 text-xl font-medium"
								>
									Confirmez votre mot de passe
								</Label>
								<div className="relative">
									<Input
										id={passwordInputId}
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Entrez votre mot de passe"
										className="pr-10"
										autoComplete="current-password"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									>
										{showPassword ? (
											<EyeOff className="w-4 h-4" />
										) : (
											<Eye className="w-4 h-4" />
										)}
									</button>
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									Pour des raisons de sécurité, veuillez confirmer votre mot de
									passe
								</p>
							</div>

							<div className="flex gap-3 pt-4 md:flex-row flex-col">
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
								<Button
									type="submit"
									variant="destructive"
									className="flex-1"
									disabled={deleteOfficeMutation.isPending || !password.trim()}
								>
									{deleteOfficeMutation.isPending ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Suppression...
										</>
									) : (
										<>
											<Trash2 className="w-4 h-4 mr-2" />
											Supprimer définitivement
										</>
									)}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
