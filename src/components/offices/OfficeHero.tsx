import FoundRestauBadge from "@/components/FoundRestauBadge";

interface OfficeHeroProps {
	officeName: string;
	restaurantsLength: number;
}

export function OfficeHero({ officeName, restaurantsLength }: OfficeHeroProps) {
	return (
		<section className="container mx-auto px-4">
			<div className="text-center space-y-6 max-w-4xl mx-auto">
				{/* Title & Description */}
				<div className="space-y-4 pt-12">
					<h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
						Restaurants {officeName}
					</h1>
					<p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
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
