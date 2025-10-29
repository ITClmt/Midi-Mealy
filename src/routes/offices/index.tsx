import { createFileRoute } from "@tanstack/react-router";
import { Building2, MapPin } from "lucide-react";
import OfficesCard from "@/components/OfficesCard";
import { fetchOffices } from "@/services/offices/offices.api";
import type { OfficesCardProps } from "@/services/offices/offices.types";

export const Route = createFileRoute("/offices/")({
	component: RouteComponent,
	loader: async () => fetchOffices(),
});

function RouteComponent() {
	const offices = Route.useLoaderData();

	return (
		<section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
			{/* Hero Section */}
			<section className="container mx-auto px-4 py-16">
				<div className="text-center space-y-6 max-w-4xl mx-auto">
					{/* Icon & Badge */}
					<div className="flex flex-col items-center gap-4">
						<div className="relative">
							<div className="absolute inset-0 bg-blue-600 rounded-full blur-2xl opacity-20 animate-pulse" />
							<div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-6 rounded-3xl shadow-2xl">
								<Building2 className="w-20 h-20" />
							</div>
						</div>
					</div>

					{/* Title & Description */}
					<div className="space-y-4">
						<h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
							Nos Bureaux
						</h1>
						<p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150">
							Découvrez nos bureaux et trouvez le restaurant parfait pour votre
							pause déjeuner
						</p>
					</div>
				</div>

				{/* Offices Grid */}
				<section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
					{offices?.map((office) => (
						<OfficesCard key={office.id} office={office} />
					))}
				</section>

				{/* Empty State */}
				{offices?.length === 0 && (
					<div className="text-center mt-16">
						<div className="text-gray-400 text-6xl mb-4">🏢</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-2">
							Aucun bureau trouvé
						</h3>
						<p className="text-gray-600">
							Il n'y a pas encore de bureaux enregistrés.
						</p>
					</div>
				)}
			</section>
		</section>
	);
}
