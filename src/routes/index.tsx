import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Clock,
	MapPin,
	Search,
	Star,
	TrendingUp,
	Utensils,
} from "lucide-react";
import { useId } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/components/ui/card";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const featuresId = useId();
	const statsId = useId();
	const roadmapId = useId();
	return (
		<main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
			<nav className="flex justify-end gap-4 p-4">
				<Link
					to="/auth/signup"
					className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors duration-300"
				>
					Crée un compte
				</Link>
				<Link
					to="/auth/login"
					className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors duration-300"
				>
					Connexion
				</Link>
			</nav>
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
						<Button
							size="lg"
							className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8"
						>
							<MapPin className="mr-2 h-5 w-5" />
							Explorer la carte
						</Button>

						<Button
							size="lg"
							variant="outline"
							className="border-2 border-red-600 text-red-600 hover:bg-red-50 shadow-md hover:shadow-lg transition-all duration-300 text-lg px-8"
						>
							<Star className="mr-2 h-5 w-5" />
							Top restaurants
						</Button>
					</div>
				</header>

				{/* Features Grid */}
				<section
					className="grid md:grid-cols-3 gap-6 mt-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500"
					aria-labelledby={featuresId}
				>
					<h2 id={featuresId} className="sr-only">
						Fonctionnalités principales
					</h2>
					<FeatureCard
						icon={<MapPin className="w-10 h-10" />}
						title="Carte interactive"
						description="Visualise tous les restaurants proches sur une carte avec géolocalisation en temps réel"
						gradient="from-blue-500 to-cyan-500"
					/>

					<FeatureCard
						icon={<Star className="w-10 h-10" />}
						title="Notes & Avis"
						description="Système de notation 1-5 étoiles avec commentaires détaillés et photos"
						gradient="from-yellow-500 to-orange-500"
					/>

					<FeatureCard
						icon={<Search className="w-10 h-10" />}
						title="Recherche & Filtres"
						description="Filtre par distance, note moyenne, type de cuisine et tags personnalisés"
						gradient="from-purple-500 to-pink-500"
					/>
				</section>

				{/* Stats Section */}
				<section
					className="grid md:grid-cols-3 gap-6 mt-12"
					aria-labelledby={statsId}
				>
					<h2 id={statsId} className="sr-only">
						Statistiques
					</h2>
					<StatCard
						icon={<TrendingUp className="w-8 h-8 text-green-600" />}
						value="0"
						label="Restaurants référencés"
						trend="+12 cette semaine"
					/>
					<StatCard
						icon={<Star className="w-8 h-8 text-yellow-600" />}
						value="0"
						label="Avis postés"
						trend="4.2/5 moyenne générale"
					/>
					<StatCard
						icon={<Clock className="w-8 h-8 text-blue-600" />}
						value="< 5min"
						label="Temps de marche moyen"
						trend="Depuis ton bureau"
					/>
				</section>

				{/* Roadmap Card */}
				<section aria-labelledby={roadmapId}>
					<Card className="mt-16 max-w-4xl mx-auto shadow-xl border-2 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
						<CardHeader className="text-center">
							<h2
								id={roadmapId}
								className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2"
							>
								<span>🗺️</span> Roadmap
							</h2>
							<CardDescription className="text-base">
								Les fonctionnalités à venir pour rendre Midi-Mealy encore
								meilleur
							</CardDescription>
						</CardHeader>
						<CardContent>
							<article className="grid md:grid-cols-2 gap-4">
								<div className="space-y-3">
									<h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
										<span className="text-green-600">✓</span> Version 1.0
									</h3>
									<RoadmapItem text="Carte interactive Leaflet" done />
									<RoadmapItem text="Système de notation 1-5" done />
									<RoadmapItem text="Calcul de distance" done />
									<RoadmapItem text="Recherche & filtres" done />
								</div>
								<div className="space-y-3">
									<h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
										<span className="text-blue-600">○</span> Version 2.0
									</h3>
									<RoadmapItem text="Authentification utilisateurs" />
									<RoadmapItem text="Upload de photos" />
									<RoadmapItem text="Tags personnalisés" />
									<RoadmapItem text="Favoris & listes" />
								</div>
							</article>
						</CardContent>
					</Card>
				</section>

				{/* Tech Stack Footer */}
				<footer className="mt-16 text-center space-y-4">
					<p className="text-sm text-gray-500 font-medium">STACK TECHNIQUE</p>
					<div className="flex flex-wrap justify-center gap-3">
						<TechBadge text="TanStack Start" />
						<TechBadge text="React 19" />
						<TechBadge text="TypeScript" />
						<TechBadge text="Supabase" />
						<TechBadge text="React-Leaflet" />
						<TechBadge text="Tailwind CSS" />
						<TechBadge text="Shadcn/ui" />
					</div>
				</footer>
			</section>
		</main>
	);
}

// Feature Card Component
interface FeatureCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	gradient: string;
}

const FeatureCard = ({
	icon,
	title,
	description,
	gradient,
}: FeatureCardProps) => {
	return (
		<Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-gray-200">
			<CardHeader>
				<div
					className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
					aria-hidden="true"
				>
					{icon}
				</div>
				<h3 className="text-2xl font-semibold leading-none tracking-tight">
					{title}
				</h3>
				<CardDescription className="text-base leading-relaxed">
					{description}
				</CardDescription>
			</CardHeader>
		</Card>
	);
};

// Stat Card Component
interface StatCardProps {
	icon: React.ReactNode;
	value: string;
	label: string;
	trend: string;
}

const StatCard = ({ icon, value, label, trend }: StatCardProps) => {
	return (
		<Card className="text-center hover:shadow-lg transition-shadow">
			<CardContent className="pt-6 space-y-2">
				<div className="flex justify-center" aria-hidden="true">
					{icon}
				</div>
				<p className="text-4xl font-bold text-gray-900">{value}</p>
				<p className="text-sm font-medium text-gray-700">{label}</p>
				<p className="text-xs text-gray-500">{trend}</p>
			</CardContent>
		</Card>
	);
};

// Roadmap Item Component
interface RoadmapItemProps {
	text: string;
	done?: boolean;
}

const RoadmapItem = ({ text, done = false }: RoadmapItemProps) => {
	return (
		<div className="flex items-start gap-2">
			<span className={done ? "text-green-600" : "text-gray-400"}>
				{done ? "✓" : "○"}
			</span>
			<span className={done ? "text-gray-700" : "text-gray-500"}>{text}</span>
		</div>
	);
};

// Tech Badge Component
const TechBadge = ({ text }: { text: string }) => {
	return (
		<Badge
			variant="outline"
			className="text-sm px-4 py-1 hover:bg-gray-100 transition-colors"
		>
			{text}
		</Badge>
	);
};
