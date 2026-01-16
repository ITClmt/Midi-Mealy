import { createFileRoute, redirect } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserSection } from "@/components/profile/UserSection";

export const Route = createFileRoute("/profile/$userId")({
	component: RouteComponent,
	beforeLoad: async ({ context, params }) => {
		const { authState } = context;
		if (!authState.isAuthenticated) {
			throw redirect({ to: "/" });
		}

		if (!params.userId || params.userId !== authState.user?.id) {
			throw redirect({ to: "/" });
		}
	},
});

function RouteComponent() {
	const { authState } = Route.useRouteContext();
	const { userId } = Route.useParams();

	// Type guard: ensure authState is authenticated
	if (!authState.user) {
		throw new Error("User must be authenticated to view this page");
	}

	// Récupérer le dernier officeId visité depuis sessionStorage ou utiliser "1" par défaut
	const lastOfficeId =
		typeof window !== "undefined"
			? sessionStorage.getItem("lastOfficeId") || "1"
			: "1";

	return (
		<div className="flex flex-1">
			<Sidebar officeId={lastOfficeId} userId={userId} />
			<main className="flex-1 bg-background pb-16 md:pb-0 overflow-auto p-6">
				<UserSection user={authState.user} />
			</main>
		</div>
	);
}
