import { useEffect, useState } from "react";
import {
	getMembershipStatus,
	leaveOffice,
	type OfficeMember,
} from "@/services/officeMember/officeMember.api";
import { joinOffice } from "@/services/offices/offices.api";
import type { Office } from "@/services/offices/offices.types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const JoinOfficeButton = ({ officeData }: { officeData: Office }) => {
	const [membership, setMembership] = useState<OfficeMember | null>(null);
	const [loading, setLoading] = useState(true);
	const [code, setCode] = useState("");
	const [error, setError] = useState("");

	// Vérifier si déjà membre
	useEffect(() => {
		getMembershipStatus({ data: { office_id: Number(officeData.id) } })
			.then((res) => {
				if (res.isMember && res.member) {
					setMembership(res.member);
				}
			})
			.finally(() => setLoading(false));
	}, [officeData.id]);

	const handleJoin = async () => {
		setError("");
		const result = await joinOffice({
			data: { office_id: Number(officeData.id), code: code || undefined },
		});

		if (result.success) {
			// Rafraîchir le statut
			const res = await getMembershipStatus({
				data: { office_id: Number(officeData.id) },
			});
			if (res.isMember && res.member) {
				setMembership(res.member);
			}
		} else {
			setError(result.error || "Erreur");
		}
	};

	const handleLeave = async () => {
		if (!membership) return;
		const result = await leaveOffice({ data: { member_id: membership.id } });
		if (result.success) {
			setMembership(null);
		}
	};

	if (loading) {
		return <div className="p-4 text-center text-muted-foreground">...</div>;
	}

	// Déjà membre
	if (membership) {
		return (
			<div className="flex items-center justify-center">
				<Button variant="outline" onClick={handleLeave}>
					Quitter {officeData.name}
				</Button>
			</div>
		);
	}

	// Pas encore membre
	return (
		<div className="flex flex-col items-center gap-3">
			{officeData.join_policy === "code_required" && (
				<Input
					placeholder="Code d'invitation"
					value={code}
					onChange={(e) => setCode(e.target.value.toUpperCase())}
					className="max-w-[200px] text-center font-mono tracking-widest"
					maxLength={8}
				/>
			)}

			<Button onClick={handleJoin}>Rejoindre {officeData.name}</Button>

			{error && (
				<p className="max-w-[180px] text-center text-sm text-destructive">
					{error}
				</p>
			)}
		</div>
	);
};
