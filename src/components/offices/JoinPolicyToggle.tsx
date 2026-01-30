import { Globe, Lock } from "lucide-react";
import { useState } from "react";
import { updateOffice } from "@/services/offices/offices.api";
import type { Office } from "@/services/offices/offices.types";
import { Button } from "../ui/button";

interface JoinPolicyToggleProps {
	office: Office;
	onUpdate?: () => void;
}

export function JoinPolicyToggle({ office, onUpdate }: JoinPolicyToggleProps) {
	const [policy, setPolicy] = useState(office.join_policy);
	const [loading, setLoading] = useState(false);

	const handleToggle = async () => {
		const newPolicy = policy === "open" ? "code_required" : "open";
		setLoading(true);

		try {
			await updateOffice({
				data: {
					id: Number(office.id),
					updates: { join_policy: newPolicy },
				},
			});
			setPolicy(newPolicy);
			onUpdate?.();
		} catch (err) {
			console.error("Erreur lors de la mise à jour:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center gap-3">
			<span className="text-sm text-muted-foreground">Accès :</span>
			<Button
				variant={policy === "open" ? "default" : "outline"}
				size="sm"
				onClick={handleToggle}
				disabled={loading}
				className="gap-2"
			>
				{policy === "open" ? (
					<>
						<Globe className="w-4 h-4" />
						Ouvert
					</>
				) : (
					<>
						<Lock className="w-4 h-4" />
						Code requis
					</>
				)}
			</Button>
		</div>
	);
}
