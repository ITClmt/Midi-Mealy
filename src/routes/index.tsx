import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="min-h-screen bg-background flex flex-col justify-center">
			<section className="container mx-auto px-4 py-16">
				<div className="max-w-3xl mx-auto text-center space-y-8">
					{/* Logo & Badge */}
					<div className="flex flex-col items-center gap-6">
						<div className="p-4 bg-primary/10 rounded-2xl text-primary">
							<Utensils className="w-12 h-12" />
						</div>
						<Badge variant="outline" className="text-sm px-3 py-1 font-normal">
							v1.0 Beta
						</Badge>
					</div>

					{/* Title & Description */}
					<div className="space-y-6">
						<h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
							Midi-Mealy
						</h1>
						<p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
							Découvrez et notez les meilleurs restaurants autour de votre
							bureau. Simple, rapide, collaboratif.
						</p>
					</div>

					{/* CTA Buttons */}
					<div className="pt-4">
						<Link to="/offices" preload="render">
							<Button size="lg" className="text-lg px-8 h-12 rounded-full">
								<MapPin className="mr-2 h-5 w-5" />
								Trouver mon bureau
							</Button>
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
