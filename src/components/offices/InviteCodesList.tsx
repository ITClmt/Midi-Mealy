import { Ban, Check, Copy, RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { OfficeInviteCode } from "@/services/officeCode/officeCode";
import {
	deleteInviteCode,
	getInviteCodes,
	reactivateInviteCode,
	revokeInviteCode,
} from "@/services/officeCode/officeCode.api";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface InviteCodesListProps {
	officeId: number;
	refreshKey?: number;
}

function getCodeStatus(code: OfficeInviteCode) {
	if (!code.is_active) return "inactive";
	if (new Date(code.expires_at) < new Date()) return "expired";
	if (code.max_uses !== null && code.uses_count >= code.max_uses)
		return "maxed";
	return "active";
}

function StatusBadge({ status }: { status: string }) {
	switch (status) {
		case "active":
			return (
				<Badge
					variant="outline"
					className="text-green-600 border-green-300 text-[10px] px-1.5 py-0"
				>
					Actif
				</Badge>
			);
		case "inactive":
			return (
				<Badge
					variant="outline"
					className="text-orange-600 border-orange-300 text-[10px] px-1.5 py-0"
				>
					Désactivé
				</Badge>
			);
		case "expired":
			return (
				<Badge
					variant="outline"
					className="text-red-600 border-red-300 text-[10px] px-1.5 py-0"
				>
					Expiré
				</Badge>
			);
		case "maxed":
			return (
				<Badge
					variant="outline"
					className="text-muted-foreground text-[10px] px-1.5 py-0"
				>
					Max atteint
				</Badge>
			);
		default:
			return null;
	}
}

export function InviteCodesList({
	officeId,
	refreshKey = 0,
}: InviteCodesListProps) {
	const [codes, setCodes] = useState<OfficeInviteCode[]>([]);
	const [loading, setLoading] = useState(true);
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const fetchCodes = useCallback(async () => {
		setLoading(true);
		const result = await getInviteCodes({ data: { office_id: officeId } });
		if (result.success && result.codes) {
			setCodes(result.codes);
		}
		setLoading(false);
	}, [officeId]);

	useEffect(() => {
		fetchCodes();
	}, [fetchCodes]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey triggers re-fetch intentionally
	useEffect(() => {
		if (refreshKey > 0) {
			fetchCodes();
		}
	}, [refreshKey]);

	const handleCopy = async (code: string, id: string) => {
		await navigator.clipboard.writeText(code);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 2000);
	};

	const handleRevoke = async (codeId: string) => {
		const result = await revokeInviteCode({ data: { code_id: codeId } });
		if (result.success) {
			setCodes((prev) =>
				prev.map((c) => (c.id === codeId ? { ...c, is_active: false } : c)),
			);
		}
	};

	const handleDelete = async (codeId: string) => {
		const result = await deleteInviteCode({ data: { code_id: codeId } });
		if (result.success) {
			setCodes((prev) => prev.filter((c) => c.id !== codeId));
		}
	};

	const handleReactivate = async (codeId: string) => {
		const result = await reactivateInviteCode({ data: { code_id: codeId } });
		if (result.success) {
			setCodes((prev) =>
				prev.map((c) => (c.id === codeId ? { ...c, is_active: true } : c)),
			);
		}
	};

	if (loading) {
		return <p className="text-sm text-muted-foreground p-4">Chargement...</p>;
	}

	if (codes.length === 0) {
		return (
			<p className="text-sm text-muted-foreground p-4">
				Aucun code généré pour le moment.
			</p>
		);
	}

	return (
		<div className="p-4 border rounded-lg bg-muted/30">
			<h4 className="font-medium text-sm mb-3">
				Codes d'invitation ({codes.length})
			</h4>

			<div className="space-y-2 max-h-60 overflow-y-auto pr-1">
				{codes.map((code) => {
					const status = getCodeStatus(code);
					const isUsable = status === "active";

					return (
						<div
							key={code.id}
							className={`flex items-center justify-between gap-3 p-2 rounded border ${
								isUsable ? "bg-background" : "bg-muted/50 opacity-60"
							}`}
						>
							{/* Code + badge */}
							<div className="flex items-center gap-2 min-w-0">
								<code className="font-mono text-sm tracking-widest">
									{code.code}
								</code>
								<StatusBadge status={status} />
							</div>

							{/* Infos */}
							<div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
								<span>
									{code.uses_count}
									{code.max_uses !== null ? `/${code.max_uses}` : ""} utilisé
									{code.uses_count > 1 ? "s" : ""}
								</span>
								<span>
									Expire {new Date(code.expires_at).toLocaleDateString("fr-FR")}
								</span>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-1 shrink-0">
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7"
									onClick={() => handleCopy(code.code, code.id)}
									title="Copier"
								>
									{copiedId === code.id ? (
										<Check className="w-3.5 h-3.5 text-green-500" />
									) : (
										<Copy className="w-3.5 h-3.5" />
									)}
								</Button>
								{isUsable && (
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7"
										onClick={() => handleRevoke(code.id)}
										title="Désactiver"
									>
										<Ban className="w-3.5 h-3.5 text-orange-500" />
									</Button>
								)}
								{status === "inactive" && (
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7"
										onClick={() => handleReactivate(code.id)}
										title="Réactiver"
									>
										<RotateCcw className="w-3.5 h-3.5 text-green-500" />
									</Button>
								)}
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7"
									onClick={() => handleDelete(code.id)}
									title="Supprimer"
								>
									<Trash2 className="w-3.5 h-3.5 text-destructive" />
								</Button>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
