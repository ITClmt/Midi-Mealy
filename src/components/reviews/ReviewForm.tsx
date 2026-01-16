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
			<div className="flex items-center justify-center py-4">
				<div className="w-6 h-6 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmitReview} className="space-y-4">
			{/* Rating */}
			<div>
				<label
					className="block text-sm font-medium text-foreground mb-2"
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
								className={`w-7 h-7 ${
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
					className="block text-sm font-medium text-foreground mb-2"
				>
					Votre avis (optionnel)
				</label>
				<textarea
					id={commentId}
					rows={3}
					className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
					placeholder="Partagez votre expérience..."
					value={comment}
					onChange={(e) => setComment(e.target.value)}
				/>
			</div>

			{/* Buttons */}
			<div className="flex gap-3">
				<button
					type="submit"
					disabled={isPending || rating === 0}
					className="bg-primary text-primary-foreground font-medium py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isPending
						? "En cours..."
						: isEditing
							? "Modifier mon avis"
							: "Envoyer"}
				</button>
				{isEditing && (
					<button
						type="button"
						onClick={handleDelete}
						disabled={isPending}
						className="px-3 py-2 bg-destructive/10 text-destructive font-medium rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						title="Supprimer mon avis"
					>
						<Trash2 className="w-4 h-4" />
					</button>
				)}
			</div>
		</form>
	);
}
