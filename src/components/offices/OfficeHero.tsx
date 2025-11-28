import FoundRestauBadge from "@/components/FoundRestauBadge";

interface OfficeHeroProps {
	officeName: string;
	restaurantsLength: number;
}

export function OfficeHero({ officeName, restaurantsLength }: OfficeHeroProps) {
	return (
		<section className="container mx-auto px-4">
			<div className="text-center space-y-8 max-w-4xl mx-auto pt-12 pb-8">
				{/* Title & Description */}
				<div className="space-y-6">
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
						Restaurants {officeName}
					</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
						Découvrez les meilleurs restaurants à proximité de {officeName}
					</p>
				</div>
			</div>

			{/* Restaurants Stats */}
			{restaurantsLength > 0 && (
				<FoundRestauBadge
					restaurantsLength={restaurantsLength}
					officeName={officeName}
				/>
			)}
		</section>
	);
}
