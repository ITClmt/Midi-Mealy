import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { JoinOfficeButton } from "@/components/offices/JoinOfficeButton";
import { OfficeHero } from "@/components/offices/OfficeHero";
import { OfficeManagement } from "@/components/offices/OfficeManagement";
import ReviewSection from "@/components/reviews/ReviewSection";
import { useOfficeRestaurants } from "@/hooks/useOfficeRestaurants";
import { fetchOfficeById } from "@/services/offices/offices.api";

export const Route = createFileRoute("/offices/$officeId")({
	component: OfficeLayoutComponent,
	ssr: "data-only",
	loader: async ({ params }) => {
		return await fetchOfficeById({ data: Number(params.officeId) });
	},
});

function OfficeLayoutComponent() {
	const office = Route.useLoaderData();
	const { officeId } = Route.useParams();
	const { authState } = Route.useRouteContext();
	const matches = useMatches();

	const { restaurants, isError, isPending, error } = useOfficeRestaurants(
		office,
		officeId,
	);

	// Vérifier si l'utilisateur connecté est le manager du bureau
	const isManager =
		authState?.isAuthenticated && authState?.user?.id === office?.manager_id;

	// Vérifier si on est sur une route enfant (search, map)
	const isChildRoute = matches.some(
		(match) =>
			match.routeId.includes("/search") || match.routeId.includes("/map"),
	);

	// Si on est sur une route enfant (search, map), on affiche le Outlet
	if (isChildRoute) {
		return <Outlet />;
	}

	// Layout unique — seul le contenu central change selon l'état
	return (
		<div className="flex flex-1">
			<Sidebar officeId={officeId} userId={authState?.user?.id} />
			<main className="flex-1 bg-background pb-16 md:pb-0 overflow-auto">
				<OfficeHero
					officeName={office.name}
					restaurantsLength={restaurants?.length ?? 0}
				/>
				<OfficeManagement office={office} isManager={isManager} />

				{/* Contenu conditionnel */}
				{isError && (
					<div className="p-6 text-center">
						<p className="text-destructive font-medium">
							Erreur lors du chargement des restaurants
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							{error?.message}
						</p>
					</div>
				)}

				{isPending && (
					<div className="p-6 animate-pulse">
						<div className="h-8 bg-muted rounded w-1/3 mb-6" />
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{[1, 2, 3].map((i) => (
								<div key={i} className="h-32 bg-muted rounded-xl" />
							))}
						</div>
					</div>
				)}

				{!isPending && !isError && restaurants?.length === 0 && (
					<div className="p-6 text-center">
						<p className="text-lg text-muted-foreground">
							Aucun restaurant trouvé à proximité
						</p>
					</div>
				)}

				{!isPending && !isError && restaurants && restaurants.length > 0 && (
					<ReviewSection office={office} restaurants={restaurants} />
				)}

				{!isManager && (
					<div className="lg:absolute lg:top-8 lg:right-4 mt-8">
						<JoinOfficeButton officeData={office} />
					</div>
				)}
			</main>
		</div>
	);
}
