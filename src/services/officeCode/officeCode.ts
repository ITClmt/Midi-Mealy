export type JoinPolicy = "open" | "code_required";

export interface OfficeInviteCode {
	id: string;
	office_id: number;
	code: string;
	created_by: string;
	expires_at: string;
	max_uses: number | null;
	uses_count: number;
	is_active: boolean;
	created_at: string;
}
