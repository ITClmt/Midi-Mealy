import { Check, Copy, Plus } from "lucide-react";
import { useId, useState } from "react";
import { generateInviteCode } from "@/services/officeCode/officeCode.api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface GenerateCodeFormProps {
	officeId: number;
	onCodeGenerated?: () => void;
}

export function GenerateCodeForm({
	officeId,
	onCodeGenerated,
}: GenerateCodeFormProps) {
	const expiresId = useId();
	const maxUsesId = useId();
	const [expiresInDays, setExpiresInDays] = useState(7);
	const [maxUses, setMaxUses] = useState<number | "">("");
	const [generatedCode, setGeneratedCode] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [copied, setCopied] = useState(false);

	const handleGenerate = async () => {
		setLoading(true);
		setError("");
		setGeneratedCode(null);

		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + expiresInDays);

		const result = await generateInviteCode({
			data: {
				office_id: officeId,
				expires_at: expiresAt.toISOString(),
				max_uses: maxUses === "" ? null : maxUses,
			},
		});

		setLoading(false);

		if (result.success && result.code) {
			setGeneratedCode(result.code.code);
			onCodeGenerated?.();
		} else {
			setError(result.error || "Erreur lors de la génération");
		}
	};

	const handleCopy = async () => {
		if (!generatedCode) return;
		await navigator.clipboard.writeText(generatedCode);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="space-y-4 p-4 border rounded-lg bg-muted/30">
			<h4 className="font-medium text-sm">Générer un code d'invitation</h4>

			<div className="flex flex-wrap gap-4">
				<div className="space-y-1">
					<Label htmlFor={expiresId}>Expire dans (jours)</Label>
					<Input
						id={expiresId}
						type="number"
						min={1}
						max={365}
						value={expiresInDays}
						onChange={(e) => setExpiresInDays(Number(e.target.value))}
						className="w-24"
					/>
				</div>

				<div className="space-y-1">
					<Label htmlFor={maxUsesId}>Utilisations max</Label>
					<Input
						id={maxUsesId}
						type="number"
						min={1}
						placeholder="∞"
						value={maxUses}
						onChange={(e) =>
							setMaxUses(e.target.value === "" ? "" : Number(e.target.value))
						}
						className="w-24"
					/>
				</div>
			</div>

			{!generatedCode ? (
				<Button onClick={handleGenerate} disabled={loading} size="sm">
					<Plus className="w-4 h-4 mr-2" />
					{loading ? "Génération..." : "Générer un code"}
				</Button>
			) : (
				<div className="flex items-center gap-2">
					<code className="px-3 py-2 bg-background border rounded font-mono text-lg tracking-widest">
						{generatedCode}
					</code>
					<Button variant="outline" size="icon" onClick={handleCopy}>
						{copied ? (
							<Check className="w-4 h-4 text-green-500" />
						) : (
							<Copy className="w-4 h-4" />
						)}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setGeneratedCode(null)}
					>
						Nouveau
					</Button>
				</div>
			)}

			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}
