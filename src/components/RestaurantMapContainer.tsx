"use client";

import { lazy, Suspense } from "react";
import type { RestaurantMapContainerProps } from "@/services/restaurants/restaurants.types";

// Import dynamique du composant RestaurantMap pour éviter les erreurs SSR
const RestaurantMapComponent = lazy(() =>
	import("./RestaurantMap").then((mod) => ({ default: mod.RestaurantMap })),
);

export const RestaurantMapContainer = (props: RestaurantMapContainerProps) => {
	return (
		<Suspense
			fallback={
				<div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg">
					<div className="text-gray-500">
						Chargement de la carte des restaurants...
					</div>
				</div>
			}
		>
			<RestaurantMapComponent {...props} />
		</Suspense>
	);
};
