import { createFileRoute } from "@tanstack/react-router";
import { Building2, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import OfficesCard from "@/components/OfficesCard";
import { CreateOfficeForm } from "@/components/offices/CreateOfficeForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchOffices } from "@/services/offices/offices.api";

export const Route = createFileRoute("/offices/")({
	component: RouteComponent,
	loader: async () => fetchOffices(),
});

function RouteComponent() {
	const offices = Route.useLoaderData();
	const { authState } = Route.useRouteContext();
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const isAuthenticated = authState?.isAuthenticated;

	// Filtrer les bureaux par nom ou ville
	const filteredOffices = useMemo(() => {
		if (!offices) return [];
		if (!searchQuery.trim()) return offices;

		const query = searchQuery.toLowerCase().trim();
		return offices.filter(
			(office) =>
				office.name.toLowerCase().includes(query) ||
				office.city?.toLowerCase().includes(query) ||
				office.street?.toLowerCase().includes(query),
		);
	}, [offices, searchQuery]);

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
							Bureaux / Entreprises
						</h1>
						<p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
							Trouvez le restaurant parfait pour votre pause déjeuner.
						</p>
					</div>

					{/* Search Input */}
					<div className="relative max-w-md mx-auto">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Rechercher un bureau par nom ou ville..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 h-12"
						/>
					</div>

					{/* Create Office Button */}
					{isAuthenticated && !showCreateForm && (
						<Button
							onClick={() => setShowCreateForm(true)}
							size="lg"
							className="gap-2"
						>
							<Plus className="w-5 h-5" />
							Créer un bureau
						</Button>
					)}
				</div>

				{/* Create Office Form */}
				{showCreateForm && (
					<div className="max-w-lg mx-auto mb-16 relative">
						<Button
							variant="ghost"
							size="icon"
							className="absolute -top-2 -right-2 z-10 rounded-full bg-background border shadow-sm"
							onClick={() => setShowCreateForm(false)}
						>
							<X className="w-4 h-4" />
						</Button>
						<CreateOfficeForm
							onSuccess={() => setShowCreateForm(false)}
							onCancel={() => setShowCreateForm(false)}
						/>
					</div>
				)}

				{/* Search Results Info */}
				{searchQuery.trim() && (
					<div className="text-center mb-6 text-muted-foreground">
						{filteredOffices.length} résultat
						{filteredOffices.length !== 1 ? "s" : ""} pour "{searchQuery}"
					</div>
				)}

				{/* Offices Grid */}
				<section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredOffices.map((office) => (
						<OfficesCard key={office.id} office={office} />
					))}
				</section>

				{/* Empty State - No offices at all */}
				{offices?.length === 0 && (
					<div className="text-center mt-16 space-y-4">
						<div className="text-6xl">🏢</div>
						<h3 className="text-2xl font-bold text-foreground">
							Aucun bureau trouvé
						</h3>
						<p className="text-muted-foreground">
							Il n'y a pas encore de bureaux enregistrés.
						</p>
						{isAuthenticated && (
							<Button
								onClick={() => setShowCreateForm(true)}
								className="mt-4 gap-2"
							>
								<Plus className="w-4 h-4" />
								Créer le premier bureau
							</Button>
						)}
					</div>
				)}

				{/* Empty State - No search results */}
				{offices &&
					offices.length > 0 &&
					filteredOffices.length === 0 &&
					searchQuery.trim() && (
						<div className="text-center mt-16 space-y-4">
							<div className="text-6xl">🔍</div>
							<h3 className="text-2xl font-bold text-foreground">
								Aucun résultat
							</h3>
							<p className="text-muted-foreground">
								Aucun bureau ne correspond à votre recherche "{searchQuery}".
							</p>
							<Button
								variant="outline"
								onClick={() => setSearchQuery("")}
								className="mt-4"
							>
								Effacer la recherche
							</Button>
						</div>
					)}
			</div>
		</section>
	);
}
