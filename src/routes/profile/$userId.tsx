import { createFileRoute, redirect } from "@tanstack/react-router";
import { UserSection } from "@/components/profile/UserSection";

export const Route = createFileRoute("/profile/$userId")({
	component: RouteComponent,
	beforeLoad: async ({ context, params }) => {
		const { authState } = context;
		if (!authState.isAuthenticated) {
			throw redirect({ to: "/auth/login" });
		}

		if (!params.userId || params.userId !== authState.user?.id) {
			throw redirect({ to: "/" });
		}
	},
});

function RouteComponent() {
	const { authState } = Route.useRouteContext();

	// Type guard: ensure authState is authenticated
	if (!authState.user) {
		throw new Error("User must be authenticated to view this page");
	}

	return <UserSection user={authState.user} />;
}
