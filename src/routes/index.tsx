import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
	MapPin,
	Search,
	Star,
	UserPlus,
	Users,
	UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

const features = [
	{
		icon: MapPin,
		title: "Carte interactive",
		description:
			"Repère en un coup d'œil tous les restaurants autour de ton bureau grâce à OpenStreetMap.",
	},
	{
		icon: Star,
		title: "Notes & avis",
		description:
			"Note les restaurants testés et lis les avis laissés par tes collègues avant de te décider.",
	},
	{
		icon: Users,
		title: "Entre collègues",
		description:
			"Rejoins le bureau de ton équipe et découvre les adresses plébiscitées par les habitués.",
	},
];

const steps = [
	{
		title: "Rejoins ton bureau",
		description:
			"Crée ou rejoins le bureau de ton équipe avec un code d'invitation.",
	},
	{
		title: "Explore les restos",
		description:
			"Parcours la carte ou lance une recherche autour de ton lieu de travail.",
	},
	{
		title: "Note et compare",
		description:
			"Consulte les avis de tes collègues et laisse le tien après le déjeuner.",
	},
];

function RouteComponent() {
	const { authState } = Route.useRouteContext();

	if (authState?.user) {
		return <Navigate to="/offices" />;
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Hero */}
			<section className="container mx-auto px-4 pt-20 pb-16">
				<div className="max-w-3xl mx-auto text-center space-y-8">
					<div className="flex flex-col items-center gap-6">
						<div className="p-4 bg-primary/10 rounded-2xl text-primary">
							<UtensilsCrossed className="w-12 h-12" />
						</div>
						<Badge variant="outline" className="text-sm px-3 py-1 font-normal">
							v1.0 Beta
						</Badge>
					</div>

					<div className="space-y-4">
						<h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground text-balance">
							Trouve ton resto du midi avec tes collègues
						</h1>
						<p className="text-lg text-muted-foreground max-w-xl mx-auto text-balance">
							Découvre les restaurants autour de ton bureau, consulte les avis
							de ton équipe et choisis le meilleur spot pour la pause déjeuner.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
						<Button
							asChild
							size="lg"
							className="border-0 bg-gradient-to-r from-amber-400 to-orange-500 text-foreground shadow-lg shadow-orange-500/25 hover:from-amber-500 hover:to-orange-600"
						>
							<Link to="/login">
								<UserPlus className="w-4 h-4" />
								Créer un compte
							</Link>
						</Button>
						<Button asChild size="lg" variant="outline">
							<Link to="/login">Se connecter</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="container mx-auto px-4 py-16">
				<div className="max-w-3xl mx-auto divide-y divide-border border-t border-border">
					{features.map((feature) => (
						<div key={feature.title} className="flex items-start gap-5 py-8">
							<div className="w-11 h-11 shrink-0 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
								<feature.icon className="w-5 h-5" />
							</div>
							<div className="space-y-1.5">
								<h2 className="text-lg font-semibold text-foreground">
									{feature.title}
								</h2>
								<p className="text-muted-foreground">{feature.description}</p>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* How it works */}
			<section className="container mx-auto px-4 py-16">
				<div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
					<h2 className="text-2xl sm:text-3xl font-bold text-foreground">
						Comment ça marche ?
					</h2>
					<p className="text-muted-foreground">
						Trois étapes pour ne plus jamais hésiter sur le resto du midi.
					</p>
				</div>

				<div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
					{steps.map((step, index) => (
						<div key={step.title} className="text-center space-y-3">
							<div className="w-10 h-10 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
								{index + 1}
							</div>
							<h3 className="font-semibold text-foreground">{step.title}</h3>
							<p className="text-sm text-muted-foreground">
								{step.description}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* CTA */}
			<section className="container mx-auto px-4 py-16">
				<Card className="max-w-3xl mx-auto border bg-primary/5">
					<CardContent className="py-10 flex flex-col items-center text-center gap-4">
						<Search className="w-8 h-8 text-primary" />
						<h2 className="text-2xl font-bold text-foreground">
							Prêt à trouver ton prochain resto préféré ?
						</h2>
						<p className="text-muted-foreground max-w-md">
							Rejoins ton équipe sur Midi-Mealy et ne te pose plus jamais la
							question "on mange où ce midi ?".
						</p>
						<Button
							asChild
							size="lg"
							className="mt-2 border-0 bg-gradient-to-r from-amber-400 to-orange-500 text-foreground shadow-lg shadow-orange-500/25 hover:from-amber-500 hover:to-orange-600"
						>
							<Link to="/login">
								<UserPlus className="w-4 h-4" />
								Commencer gratuitement
							</Link>
						</Button>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
