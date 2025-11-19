import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { RestaurantSearchInput } from "@/components/restaurants/RestaurantSearchInput";
import type { Restaurant } from "@/services/restaurants/restaurants.types";
import { createReview } from "@/services/reviews/reviews.api";

interface ReviewFormProps {
	restaurants: Restaurant[];
}

export function ReviewForm({ restaurants }: ReviewFormProps) {
	const [reviewSearch, setReviewSearch] = useState("");
	const [selectedReviewRestaurant, setSelectedReviewRestaurant] = useState<
		Restaurant | undefined
	>(undefined);
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const [hoveredRating, setHoveredRating] = useState(0);

	const { mutate: submitReview, isPending: isSubmittingReview } = useMutation({
		mutationFn: createReview,
		onSuccess: () => {
			toast.success("Avis envoyé avec succès !");
			// Reset form
			setReviewSearch("");
			setSelectedReviewRestaurant(undefined);
			setRating(0);
			setComment("");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleSelectReviewRestaurant = (restaurant: Restaurant) => {
		setSelectedReviewRestaurant(restaurant);
		setReviewSearch(restaurant.name);
	};

	const handleSubmitReview = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedReviewRestaurant) return;
		if (rating === 0) {
			toast.error("Veuillez sélectionner une note");
			return;
		}

		submitReview({
			data: {
				restaurant_id: selectedReviewRestaurant.id,
				restaurant_name: selectedReviewRestaurant.name,
				rating,
				comment,
			},
		});
	};

	return (
		<section className="mt-12 max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-100">
			<div className="text-center mb-8">
				<h2 className="text-3xl font-bold text-gray-900 mb-2">
					Envie de noter un restaurant ?
				</h2>
				<p className="text-gray-600">
					Partagez votre expérience avec vos collègues
				</p>
			</div>

			<form onSubmit={handleSubmitReview} className="space-y-6">
				{/* Restaurant Search for Review */}
				<div className="relative">
					<label
						htmlFor="review-search"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Rechercher un restaurant
					</label>
					<RestaurantSearchInput
						restaurants={restaurants}
						value={reviewSearch}
						onChange={(value) => {
							setReviewSearch(value);
							if (value === "") {
								setSelectedReviewRestaurant(undefined);
							}
						}}
						onSelect={handleSelectReviewRestaurant}
						placeholder="Nom du restaurant..."
						selectedRestaurantId={selectedReviewRestaurant?.id}
					/>
				</div>

				{selectedReviewRestaurant && (
					<div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
						{/* Rating */}
						<div className="flex flex-col items-center gap-2">
							<label
								className="block text-sm font-medium text-gray-700"
								htmlFor="rating"
							>
								Votre note
							</label>
							<div className="flex gap-1">
								{[1, 2, 3, 4, 5].map((star) => (
									<button
										key={star}
										type="button"
										className="focus:outline-none transition-transform hover:scale-110"
										onMouseEnter={() => setHoveredRating(star)}
										onMouseLeave={() => setHoveredRating(0)}
										onClick={() => setRating(star)}
									>
										{/** biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
										<svg
											className={`w-8 h-8 ${
												star <= (hoveredRating || rating)
													? "text-yellow-400 fill-yellow-400"
													: "text-gray-300"
											}`}
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
										</svg>
									</button>
								))}
							</div>
						</div>

						{/* Comment */}
						<div>
							<label
								htmlFor="comment"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Commentaire (optionnel)
							</label>
							{/** biome-ignore lint/correctness/useUniqueElementIds: <explanation> */}
							<textarea
								id="comment"
								rows={3}
								className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								placeholder="Racontez votre expérience..."
								value={comment}
								onChange={(e) => setComment(e.target.value)}
							/>
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={isSubmittingReview || rating === 0}
							className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
						>
							{isSubmittingReview ? "Envoi en cours..." : "Envoyer mon avis"}
						</button>
					</div>
				)}
			</form>
		</section>
	);
}
