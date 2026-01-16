import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { RestaurantList } from "@/components/restaurants/RestaurantList";
import { useOfficeRestaurants } from "@/hooks/useOfficeRestaurants";
import { fetchOfficeById } from "@/services/offices/offices.api";

export const Route = createFileRoute("/offices/$officeId/search")({
	component: SearchComponent,
	loader: async ({ params }) => {
		return await fetchOfficeById({ data: Number(params.officeId) });
	},
});

function SearchComponent() {
	const office = Route.useLoaderData();
	const { officeId } = Route.useParams();
	const { authState } = Route.useRouteContext();

	const { restaurants, isPending } = useOfficeRestaurants(office, officeId);

	if (isPending) {
		return (
			<div className="flex flex-1">
				<Sidebar officeId={officeId} userId={authState?.user?.id} />
				<section className="flex-1 flex items-center justify-center">
					<div className="flex flex-col items-center gap-4">
						<div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
						<p className="text-muted-foreground">
							Chargement des restaurants...
						</p>
					</div>
				</section>
			</div>
		);
	}

	return (
		<div className="flex flex-1">
			<Sidebar officeId={officeId} userId={authState?.user?.id} />
			<main className="flex-1 bg-background pb-16 md:pb-0 overflow-auto">
				<RestaurantList restaurants={restaurants} />
			</main>
		</div>
	);
}
