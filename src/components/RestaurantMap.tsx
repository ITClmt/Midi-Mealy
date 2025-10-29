"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import type { RestaurantMapProps } from "@/services/restaurants/restaurants.types";

export const RestaurantMap = ({
	officeLogoUrl,
	center = [48.8566, 2.3522], // Paris par défaut
	zoom = 12,
	className = "w-full h-96",
	restaurants = [],
	onRestaurantClick,
}: RestaurantMapProps) => {
	const mapRef = useRef<L.Map | null>(null);
	const mapContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Vérifier que nous sommes côté client
		if (typeof window === "undefined") {
			return;
		}

		// Nettoyer l'instance précédente
		if (mapRef.current) {
			mapRef.current.remove();
			mapRef.current = null;
		}

		// Vérifier que le conteneur existe
		if (!mapContainerRef.current) {
			return;
		}

		// Créer la carte
		const map = L.map(mapContainerRef.current, {
			center,
			zoom,
			scrollWheelZoom: true,
		});

		// Ajouter les tuiles
		L.tileLayer(
			"https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png",
			{
				attribution: "©Stamen Design, ©OpenStreetMap contributors",
			},
		).addTo(map);

		// Créer une icône personnalisée pour l'office
		const officeIcon = L.divIcon({
			html: `
				<div class="relative">
					<div class="w-12 h-12 bg-white rounded-full border-4 border-red-600 shadow-lg flex items-center justify-center">
						<img 
							src="${officeLogoUrl}" 
							alt="Office" 
							class="w-8 h-8 rounded-full object-cover"
							onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
						/>
						<div class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold" style="display: none;">
							🏢
						</div>
					</div>
					<div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"></div>
				</div>
			`,
			className: "custom-office-marker",
			iconSize: [48, 48],
			iconAnchor: [24, 48],
			popupAnchor: [0, -48],
		});

		const restaurantIcon = L.icon({
			iconUrl: "/leaflet/marker-icon.png",
			iconSize: [15, 20],
			iconAnchor: [15, 30],
			popupAnchor: [0, -30],
		});

		// Ajouter le marqueur de l'office au centre
		const officeMarker = L.marker(center, {
			icon: officeIcon,
		}).addTo(map);

		officeMarker.bindPopup(`
			<div class="p-3 min-w-[200px] text-center">
				<h3 class="font-bold text-lg text-gray-900 mb-2">🏢 Bureau</h3>
				<p class="text-gray-600 text-sm">Votre point de référence</p>
			</div>
		`);

		// Ajouter les marqueurs des restaurants
		restaurants.forEach((restaurant) => {
			const marker = L.marker([restaurant.latitude, restaurant.longitude], {
				icon: restaurantIcon,
			}).addTo(map);

			// Créer le contenu de la popup
			const popupContent = `
        <div class="p-3 min-w-[200px]">
          <h3 class="font-bold text-lg text-gray-900 mb-2">${restaurant.name}</h3>
          <p class="text-gray-600 text-sm mb-2">${restaurant.address}</p>
          ${restaurant.cuisine ? `<p class="text-blue-600 text-sm mb-2">🍽️ ${restaurant.cuisine}</p>` : ""}
          ${restaurant.rating ? `<p class="text-yellow-600 text-sm">⭐ ${restaurant.rating}/5</p>` : ""}
          <button 
            class="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
            onclick="window.restaurantClickHandler && window.restaurantClickHandler('${restaurant.id}')"
          >
            Voir détails
          </button>
        </div>
      `;

			marker.bindPopup(popupContent);

			// Ajouter un gestionnaire de clic si fourni
			if (onRestaurantClick) {
				marker.on("click", () => {
					onRestaurantClick(restaurant);
				});
			}
		});

		// Exposer le gestionnaire de clic globalement pour les popups
		if (onRestaurantClick) {
			(
				window as unknown as {
					restaurantClickHandler?: (restaurantId: string) => void;
				}
			).restaurantClickHandler = (restaurantId: string) => {
				const restaurant = restaurants.find((r) => r.id === restaurantId);
				if (restaurant) {
					onRestaurantClick(restaurant);
				}
			};
		}

		mapRef.current = map;

		// Cleanup
		return () => {
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
			// Nettoyer le gestionnaire global
			if (
				(
					window as unknown as {
						restaurantClickHandler?: (restaurantId: string) => void;
					}
				).restaurantClickHandler
			) {
				delete (
					window as unknown as {
						restaurantClickHandler?: (restaurantId: string) => void;
					}
				).restaurantClickHandler;
			}
		};
	}, [center, zoom, restaurants, onRestaurantClick, officeLogoUrl]);

	return <div ref={mapContainerRef} className={className} />;
};
