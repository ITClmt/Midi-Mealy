export interface Office {
	id: string;
	name: string;
	street: string;
	city: string;
	zip_code: string;
	country: string;
	logo_url: string;
	lat: number;
	lng: number;
	manager_id?: string;
	join_policy: "open" | "code_required";
}

export interface CreateOfficeInput {
	name: string;
	street: string;
	city: string;
	zip_code: string;
	country: string;
	logo_url?: string;
	join_policy?: "open" | "code_required";
}

export interface OfficesCardProps {
	office: Office;
}

export interface OSMElement {
	id: number;
	lat?: number;
	lon?: number;
	center?: {
		lat: number;
		lon: number;
	};
	tags?: {
		name?: string;
		cuisine?: string;
		phone?: string;
		website?: string;
		opening_hours?: string;
		"addr:housenumber"?: string;
		"addr:street"?: string;
		"addr:postcode"?: string;
		"addr:city"?: string;
	};
}

export interface OSMResponse {
	elements: OSMElement[];
}

export interface Restaurant {
	id: string;
	name: string;
	lat: number;
	lng: number;
	cuisine: string | null;
	address: string | null;
	phone: string | null;
	website: string | null;
	opening_hours: string | null;
	source: string;
}
