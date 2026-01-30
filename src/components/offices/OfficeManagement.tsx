import { Pencil, Settings, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Office } from "@/services/offices/offices.types";
import { DeleteOfficeDialog } from "./DeleteOfficeDialog";
import { EditOfficeForm } from "./EditOfficeForm";
import { GenerateCodeForm } from "./GenerateCodeForm";
import { JoinPolicyToggle } from "./JoinPolicyToggle";

interface OfficeManagementProps {
	office: Office;
	isManager: boolean;
}

type ManagementView = "none" | "edit" | "delete";

export function OfficeManagement({ office, isManager }: OfficeManagementProps) {
	const [currentView, setCurrentView] = useState<ManagementView>("none");
	const [currentPolicy, setCurrentPolicy] = useState(office.join_policy);

	if (!isManager) {
		return null;
	}

	if (currentView === "edit") {
		return (
			<div className="relative mb-8">
				<Button
					variant="ghost"
					size="icon"
					className="absolute -top-2 right-0 z-10 rounded-full bg-background border shadow-sm"
					onClick={() => setCurrentView("none")}
				>
					<X className="w-4 h-4" />
				</Button>
				<EditOfficeForm
					office={office}
					onSuccess={() => setCurrentView("none")}
					onCancel={() => setCurrentView("none")}
				/>
			</div>
		);
	}

	if (currentView === "delete") {
		return (
			<div className="relative mb-8">
				<Button
					variant="ghost"
					size="icon"
					className="absolute -top-2 right-0 z-10 rounded-full bg-background border shadow-sm"
					onClick={() => setCurrentView("none")}
				>
					<X className="w-4 h-4" />
				</Button>
				<DeleteOfficeDialog
					office={office}
					onSuccess={() => setCurrentView("none")}
					onCancel={() => setCurrentView("none")}
				/>
			</div>
		);
	}

	return (
		<div className="m-8 space-y-4">
			{/* Barre d'outils principale */}
			<div className="p-4 bg-muted/50 rounded-lg border">
				<div className="flex items-center justify-between flex-wrap gap-4">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Settings className="w-4 h-4" />
							<span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
								Gérant
							</span>
						</div>
						<JoinPolicyToggle
							office={{ ...office, join_policy: currentPolicy }}
							onUpdate={() =>
								setCurrentPolicy(
									currentPolicy === "open" ? "code_required" : "open",
								)
							}
						/>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentView("edit")}
							className="gap-2"
						>
							<Pencil className="w-4 h-4" />
							Modifier
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCurrentView("delete")}
							className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
						>
							<Trash2 className="w-4 h-4" />
							Supprimer
						</Button>
					</div>
				</div>
			</div>

			{/* Formulaire de génération de code (visible seulement si code_required) */}
			{currentPolicy === "code_required" && (
				<GenerateCodeForm officeId={Number(office.id)} />
			)}
		</div>
	);
}
