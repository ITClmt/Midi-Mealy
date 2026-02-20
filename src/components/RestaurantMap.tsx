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
		L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles courtesy of <a href="https://www.openstreetmap.cat" target="_blank">Breton OpenStreetMap Team</a>',
		}).addTo(map);

		const officeIcon = L.divIcon({
			html: `
				<div class="relative">
					<div class="absolute -inset-1 bg-indigo-400 rounded-xl opacity-40 animate-pulse"></div>
					<div class="relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-xl flex items-center justify-center border-2 border-white">
						<img 
							src="${officeLogoUrl}" 
							alt="Office" 
							class="w-9 h-9 rounded-lg object-cover"
							onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
						/>
						<div class="w-9 h-9 rounded-lg flex items-center justify-center text-white text-lg" style="display: none;">
							🏢
						</div>
					</div>
					<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-transparent border-t-purple-600"></div>
				</div>
			`,
			className: "custom-office-marker",
			iconSize: [56, 56],
			iconAnchor: [28, 56],
			popupAnchor: [0, -56],
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
					<div class="relative group">
						<div class="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center border-2 border-white transition-transform hover:scale-110">
							<span class="text-white text-sm">🍽️</span>
						</div>
						<div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-transparent border-t-orange-500"></div>
					</div>
				`,
				className: "custom-restaurant-label",
				iconSize: [32, 40],
				iconAnchor: [16, 40],
				popupAnchor: [0, -40],
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
        <div class="p-3 min-w-[220px] max-w-[260px] flex flex-col gap-3 bg-white rounded-lg">
          <a 
            href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleMapsQuery)}"
            target="_blank" 
            rel="noopener noreferrer" 
            class="flex flex-col gap-1 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Voir ${restaurant.name} sur Google Maps"
            tabindex="0"
          >
            <h3 class="font-semibold text-sm text-gray-900 leading-tight">${restaurant.name}</h3>
            <span class="text-xs text-gray-500 leading-tight">${restaurant?.address || "Adresse non disponible"}</span>
          </a>
        
          <div class="flex items-center gap-2 flex-wrap">
            ${restaurant.cuisine ? `<span class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">🍽️ ${restaurant.cuisine}</span>` : ""}
            ${restaurant.rating ? `<span class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">⭐ ${restaurant.rating.toFixed(1)}</span>` : ""}
          </div>

          <a 
            href="/restaurant/${restaurant.id}"
            class="mt-1 w-full text-center py-2 px-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-medium rounded-lg hover:from-amber-500 hover:to-orange-600 transition-all shadow-sm"
          >
            ✍️ Voir / laisser un avis
          </a>
		</div>`;

			marker.bindPopup(popupContent);

			// Ajouter un gestionnaire de clic si fourni
			if (onRestaurantClick) {
				marker.on("click", () => {
					onRestaurantClick(restaurant);
				});
			}
		});

		mapRef.current = map;

		// Cleanup
		return () => {
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
			markersRef.current.clear();
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
				animate: false,
			});
			// Ouvrir la popup du restaurant
			marker.openPopup();
		}
	}, [selectedRestaurantId, restaurants]);

	return <div ref={mapContainerRef} className={className} />;
};
