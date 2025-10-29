import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Badge, MapPin, Users, Utensils } from "lucide-react";
import { RestaurantMapContainer } from "@/components/RestaurantMapContainer";
import {
	fetchOfficeById,
	fetchOSMRestaurants,
} from "@/services/offices/offices.api";

export const Route = createFileRoute("/offices/$officeId")({
	component: RestaurantComponent,
	ssr: "data-only",
	loader: async ({ params }) => {
		return await fetchOfficeById({ data: Number(params.officeId) });
	},
});

function RestaurantComponent() {
	const office = Route.useLoaderData();

	const {
		isPending,
		isError,
		data: restaurants,
		error,
	} = useQuery({
		queryKey: ["restaurants", office.id],
		queryFn: () =>
			fetchOSMRestaurants({
				data: { lat: office.lat, lng: office.lng },
			}),
	});

	if (isPending) {
		return (
			<section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
				<div className="container mx-auto px-4 py-16">
					<div className="text-center space-y-6 max-w-4xl mx-auto">
						<div className="flex flex-col items-center gap-4">
							<div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
							<p className="text-gray-600">Chargement des restaurants...</p>
						</div>
					</div>
				</div>
			</section>
		);
	}

	if (isError) {
		return <div>Error: {error?.message}</div>;
	}

	return (
		<main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
			{/* Hero Section */}
			<section className="container mx-auto px-4 py-16">
				<div className="text-center space-y-6 max-w-4xl mx-auto">
					{/* Icon & Badge */}
					<div className="flex flex-col items-center gap-4">
						<div className="relative">
							<div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-20 animate-pulse" />
							<div className="relative bg-gradient-to-br from-red-600 to-orange-600 text-white p-6 rounded-3xl shadow-2xl">
								<Utensils className="w-20 h-20" />
							</div>
						</div>
						<Badge className="text-sm px-4 py-1">
							🍽️ Restaurants {office.name}
						</Badge>
					</div>

					{/* Title & Description */}
					<div className="space-y-4">
						<h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-red-600 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
							Restaurants {office.name}
						</h1>
						<p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150">
							Découvrez les meilleurs restaurants à proximité de {office.name}
						</p>
					</div>
				</div>

				{/* Restaurants Stats */}
				{restaurants && restaurants.length > 0 && (
					<section className="mt-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
						<div className="text-center mb-8">
							<div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
								<Users className="w-4 h-4" />
								{restaurants.length} restaurants trouvés à proximité de{" "}
								{office.name}
							</div>
						</div>
					</section>
				)}

				{/* Map Section */}
				{restaurants && restaurants.length > 0 && (
					<section className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
						<div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
							<div className="flex items-center gap-3 mb-6">
								<MapPin className="w-6 h-6 text-red-600" />
								<h2 className="text-2xl font-bold text-gray-900">
									Carte des restaurants à proximité de {office.name}
								</h2>
							</div>
							<RestaurantMapContainer
								center={[office.lat, office.lng]}
								officeLogoUrl={office.logo_url}
								zoom={17}
								className="w-full h-96 rounded-lg"
								restaurants={restaurants.map((restaurant) => ({
									id: restaurant.id,
									name: restaurant.name,
									address: restaurant.address || "",
									latitude: restaurant.lat,
									longitude: restaurant.lng,
									rating: 4.0, // Placeholder
									cuisine: restaurant.cuisine || undefined,
								}))}
								onRestaurantClick={(restaurant) => {
									console.log("Restaurant sélectionné:", restaurant);
									// Ici vous pouvez ajouter la logique pour afficher les détails
								}}
							/>
						</div>
					</section>
				)}
			</section>
		</main>
	);
}
