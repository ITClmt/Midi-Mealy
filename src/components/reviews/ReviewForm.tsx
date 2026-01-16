import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "react-toastify";
import type { Restaurant } from "@/services/restaurants/restaurants.types";
import {
	createReview,
	deleteReview,
	fetchUserReviewForRestaurant,
	updateReview,
} from "@/services/reviews/reviews.api";

interface ReviewFormProps {
	restaurant: Restaurant;
}

export function ReviewForm({ restaurant }: ReviewFormProps) {
	const commentId = useId();
	const queryClient = useQueryClient();
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const [hoveredRating, setHoveredRating] = useState(0);

	// Fetch existing user review
	const { data: existingReview, isLoading: isLoadingReview } = useQuery({
		queryKey: ["user-review", restaurant.id],
		queryFn: () => fetchUserReviewForRestaurant({ data: restaurant.id }),
	});

	// Pre-fill form if user has an existing review
	useEffect(() => {
		if (existingReview) {
			setRating(existingReview.rating);
			setComment(existingReview.comment || "");
		}
	}, [existingReview]);

	const isEditing = !!existingReview;

	const invalidateQueries = () => {
		queryClient.invalidateQueries({ queryKey: ["user-review", restaurant.id] });
		queryClient.invalidateQueries({
			queryKey: ["restaurant-rating", restaurant.id],
		});
	};

	const { mutate: submitReview, isPending: isSubmittingReview } = useMutation({
		mutationFn: createReview,
		onSuccess: () => {
			toast.success("Avis envoyé avec succès !");
			invalidateQueries();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const { mutate: submitUpdate, isPending: isUpdatingReview } = useMutation({
		mutationFn: updateReview,
		onSuccess: () => {
			toast.success("Avis modifié avec succès !");
			invalidateQueries();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const { mutate: submitDelete, isPending: isDeletingReview } = useMutation({
		mutationFn: deleteReview,
		onSuccess: () => {
			toast.success("Avis supprimé avec succès !");
			setRating(0);
			setComment("");
			invalidateQueries();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleSubmitReview = (e: React.FormEvent) => {
		e.preventDefault();
		if (rating === 0) {
			toast.error("Veuillez sélectionner une note");
			return;
		}

		if (isEditing && existingReview) {
			submitUpdate({
				data: {
					reviewId: existingReview.id,
					rating,
					comment,
				},
			});
		} else {
			submitReview({
				data: {
					restaurant_id: restaurant.id,
					restaurant_name: restaurant.name,
					rating,
					comment,
				},
			});
		}
	};

	const handleDelete = () => {
		if (
			existingReview &&
			confirm("Êtes-vous sûr de vouloir supprimer votre avis ?")
		) {
			submitDelete({ data: existingReview.id });
		}
	};

	const isPending = isSubmittingReview || isUpdatingReview || isDeletingReview;

	if (isLoadingReview) {
		return (
			<section className="mt-12 max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-100">
				<div className="flex items-center justify-center py-8">
					<div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
				</div>
			</section>
		);
	}

	return (
		<section className="mt-12 max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-100">
			<div className="text-center mb-8">
				<h2 className="text-3xl font-bold text-gray-900 mb-2">
					{isEditing
						? `Modifier votre avis pour ${restaurant.name}`
						: `Noter ${restaurant.name}`}
				</h2>
				<p className="text-gray-600">
					{isEditing
						? "Mettez à jour votre expérience"
						: "Partagez votre expérience avec vos collègues"}
				</p>
				{restaurant.address && (
					<p className="text-sm text-gray-500 mt-1">{restaurant.address}</p>
				)}
			</div>

			<form onSubmit={handleSubmitReview} className="space-y-6">
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
								{/** biome-ignore lint/a11y/noSvgWithoutTitle: decorative star icon */}
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
						htmlFor={commentId}
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Commentaire (optionnel)
					</label>
					<textarea
						id={commentId}
						rows={3}
						className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="Racontez votre expérience..."
						value={comment}
						onChange={(e) => setComment(e.target.value)}
					/>
				</div>

				{/* Buttons */}
				<div className="flex gap-3">
					<button
						type="submit"
						disabled={isPending || rating === 0}
						className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
					>
						{isPending
							? "En cours..."
							: isEditing
								? "Modifier mon avis"
								: "Envoyer mon avis"}
					</button>
					{isEditing && (
						<button
							type="button"
							onClick={handleDelete}
							disabled={isPending}
							className="px-4 py-3 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							title="Supprimer mon avis"
						>
							<Trash2 className="w-5 h-5" />
						</button>
					)}
				</div>
			</form>
		</section>
	);
}
