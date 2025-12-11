import { Search, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { Restaurant } from "@/services/restaurants/restaurants.types";

interface RestaurantSearchInputProps {
	restaurants: Restaurant[];
	value: string;
	onChange: (value: string) => void;
	onSelect: (restaurant: Restaurant) => void;
	onClear?: () => void;
	placeholder?: string;
	selectedRestaurantId?: string;
	className?: string;
	showSuggestionsProps?: boolean;
}

export function RestaurantSearchInput({
	restaurants,
	value,
	onChange,
	onSelect,
	onClear,
	placeholder = "Rechercher un restaurant...",
	selectedRestaurantId,
	showSuggestionsProps,
}: RestaurantSearchInputProps) {
	const [showSuggestions, setShowSuggestions] = useState(false);
	const autocompleteRef = useRef<HTMLDivElement>(null);
	const suggestionsId = useId();

	const filteredRestaurants =
		restaurants?.filter(
			(restaurant) =>
				restaurant.name.toLowerCase().includes(value.toLowerCase()) ||
				restaurant.address?.toLowerCase().includes(value.toLowerCase()),
		) || [];

	useClickOutside(autocompleteRef, () => setShowSuggestions(false));

	const handleSelect = (restaurant: Restaurant) => {
		onSelect(restaurant);
		setShowSuggestions(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent, restaurant?: Restaurant) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			if (restaurant) {
				handleSelect(restaurant);
			} else if (onClear) {
				onClear();
			}
		}
	};

	return (
		<div className="relative" ref={autocompleteRef}>
			<div className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
				<Input
					type="text"
					placeholder={placeholder}
					value={value}
					onChange={(e) => {
						onChange(e.target.value);
						setShowSuggestions(true);
					}}
					onFocus={() => setShowSuggestions(true)}
					className="pl-10 pr-10"
					autoComplete="off"
					aria-expanded={showSuggestions}
					aria-controls={suggestionsId}
					role="combobox"
				/>
				{value && onClear && (
					<button
						type="button"
						onClick={onClear}
						className="absolute z-10 right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
						aria-label="Effacer la recherche"
						tabIndex={0}
						onKeyDown={(e) => handleKeyDown(e)}
					>
						<X className="w-4 h-4" />
					</button>
				)}
			</div>

			{showSuggestionsProps && showSuggestions && value.length > 0 && (
				<div
					id={suggestionsId}
					className="absolute z-[1001] w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
					role="listbox"
				>
					{filteredRestaurants.length > 0 ? (
						filteredRestaurants.map((restaurant) => (
							<button
								key={restaurant.id}
								type="button"
								onClick={() => handleSelect(restaurant)}
								className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
								role="option"
								aria-selected={selectedRestaurantId === restaurant.id}
								tabIndex={0}
								onKeyDown={(e) => handleKeyDown(e, restaurant)}
							>
								<div className="font-medium text-gray-900">
									{restaurant.name}
								</div>
								{restaurant.address && (
									<div className="text-sm text-gray-500 mt-1">
										{restaurant.address}
									</div>
								)}
								{restaurant.cuisine && (
									<div className="text-xs text-blue-600 mt-1">
										🍽️ {restaurant.cuisine}
									</div>
								)}
							</button>
						))
					) : (
						<div className="px-4 py-3 text-gray-500 text-sm">
							Aucun restaurant trouvé pour "{value}"
						</div>
					)}
				</div>
			)}
		</div>
	);
}
