import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import OfficesCard from "@/components/OfficesCard";
import { fetchOffices } from "@/services/offices/offices.api";

export const Route = createFileRoute("/offices/")({
	component: RouteComponent,
	loader: async () => fetchOffices(),
});

function RouteComponent() {
	const offices = Route.useLoaderData();

	return (
		<section className="min-h-screen bg-background py-16">
			<div className="container mx-auto px-4">
				<div className="max-w-3xl mx-auto text-center space-y-8 mb-16">
					{/* Icon & Badge */}
					<div className="flex flex-col items-center gap-6">
						<div className="p-4 bg-primary/10 rounded-2xl text-primary">
							<Building2 className="w-12 h-12" />
						</div>
					</div>

					{/* Title & Description */}
					<div className="space-y-6">
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
							Nos Bureaux
						</h1>
						<p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
							Découvrez nos bureaux et trouvez le restaurant parfait pour votre
							pause déjeuner.
						</p>
					</div>
				</div>

				{/* Offices Grid */}
				<section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{offices?.map((office) => (
						<OfficesCard key={office.id} office={office} />
					))}
				</section>

				{/* Empty State */}
				{offices?.length === 0 && (
					<div className="text-center mt-16 space-y-4">
						<div className="text-6xl">🏢</div>
						<h3 className="text-2xl font-bold text-foreground">
							Aucun bureau trouvé
						</h3>
						<p className="text-muted-foreground">
							Il n'y a pas encore de bureaux enregistrés.
						</p>
					</div>
				)}
			</div>
		</section>
	);
}
