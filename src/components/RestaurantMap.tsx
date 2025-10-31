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
	selectedRestaurantId,
}: RestaurantMapProps) => {
	const mapRef = useRef<L.Map | null>(null);
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const markersRef = useRef<Map<string, L.Marker>>(new Map());

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
		L.tileLayer("https://tile.openstreetmap.bzh/ca/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles courtesy of <a href="https://www.openstreetmap.cat" target="_blank">Breton OpenStreetMap Team</a>',
		}).addTo(map);

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

		// Icône simple avec libellé pour les restaurants
		// Chaque restaurant aura son propre divIcon afin d'afficher son nom en permanence

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

		// Ajouter les marqueurs des restaurants avec un label visible
		markersRef.current.clear();
		restaurants.forEach((restaurant) => {
			const labelIcon = L.divIcon({
				html: `
					<div class="flex items-center gap-2 font-sans group px-0.5 py-0.5 rounded-lg shadow-lg bg-white border-2 border-blue-200 hover:border-blue-400 transition-all" role="button" aria-label="${restaurant.name}">
						<span class="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 via-orange-400 to-red-600 border-2 border-white shadow-md"></span>
						<span class="px-2 py-1 rounded-md bg-blue-50 text-xs leading-tight font-semibold text-blue-900 shadow-sm whitespace-nowrap group-hover:bg-blue-100 transition-colors">
							${restaurant.name}
						</span>
					</div>
				`,
				className: "custom-restaurant-label",
				iconSize: [0, 0],
				iconAnchor: [0, 0],
				popupAnchor: [0, -10],
			});

			const marker = L.marker([restaurant.latitude, restaurant.longitude], {
				icon: labelIcon,
			}).addTo(map);

			markersRef.current.set(restaurant.id, marker);

			// Créer le contenu de la popup
			const googleMapsQuery = restaurant.address
				? `${restaurant.name}, ${restaurant.address}`
				: `${restaurant.latitude},${restaurant.longitude}`;

			const popupContent = `
        <div class="p-3 min-w-[200px] max-w-[240px] flex flex-col gap-2 bg-white rounded-lg">
          <a 
            href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleMapsQuery)}"
            target="_blank" 
            rel="noopener noreferrer" 
            class="flex flex-col gap-1 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Voir ${restaurant.name} sur Google Maps"
            tabindex="0"
          >
            <h3 class="font-semibold text-sm text-blue-900 leading-tight truncate">${restaurant.name}</h3>
         <span class="text-xs text-gray-600 leading-tight hover:text-blue-900 transition-colors">${restaurant?.address}</span>
          </a>
        
          <div class="flex items-center gap-2 flex-wrap">
            ${restaurant.cuisine ? `<span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 text-xs leading-tight font-medium">🍽️ ${restaurant.cuisine}</span>` : ""}
            ${restaurant.rating ? `<span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 text-xs leading-tight font-medium">⭐ ${restaurant.rating}/5</span>` : ""}
          </div>`;

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
			markersRef.current.clear();
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

	// Effet pour centrer la carte sur le restaurant sélectionné
	useEffect(() => {
		if (!selectedRestaurantId || !mapRef.current) {
			return;
		}

		const restaurant = restaurants.find((r) => r.id === selectedRestaurantId);
		if (!restaurant) {
			return;
		}

		const marker = markersRef.current.get(selectedRestaurantId);
		if (marker) {
			// Centrer la carte sur le restaurant avec animation
			mapRef.current.setView([restaurant.latitude, restaurant.longitude], 18, {
				animate: true,
				duration: 0.5,
			});
			// Ouvrir la popup du restaurant
			marker.openPopup();
		}
	}, [selectedRestaurantId, restaurants]);

	return <div ref={mapContainerRef} className={className} />;
};
