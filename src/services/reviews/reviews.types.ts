export interface Review {
	id: string;
	created_at: string;
	restaurant_id: string;
	restaurant_name: string;
	rating: number;
	comment?: string;
	user_id?: string;
	username?: string;
}

export interface CreateReviewDTO {
	restaurant_id: string;
	restaurant_name: string;
	rating: number;
	comment?: string;
}
