import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
			{/* Hero Section */}
			<section className="container mx-auto px-4 py-16">
				<header className="text-center space-y-6 max-w-4xl mx-auto">
					{/* Logo & Badge */}
					<div className="flex flex-col items-center gap-4">
						<div className="relative">
							<div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-20 animate-pulse" />
							<div className="relative bg-gradient-to-br from-red-600 to-orange-600 text-white p-6 rounded-3xl shadow-2xl">
								<Utensils className="w-20 h-20" />
							</div>
						</div>
						<Badge variant="secondary" className="text-sm px-4 py-1">
							🚀 Version Beta
						</Badge>
					</div>

					{/* Title & Description */}
					<div className="space-y-4">
						<h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-red-600 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
							Midi-Mealy
						</h1>
						<p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150">
							Découvre et note les meilleurs restaurants autour de ton bureau
							avec tes collègues
						</p>
					</div>

					{/* CTA Buttons */}
					<div className="flex flex-wrap justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
						<Link to="/offices">
							<Button
								size="lg"
								className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8"
							>
								<MapPin className="mr-2 h-5 w-5" />
								Bureaux
							</Button>
						</Link>
					</div>
				</header>
			</section>
		</main>
	);
}
