import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OfficesCardProps } from "@/services/offices/offices.types";

const OfficesCard = ({ office }: OfficesCardProps) => {
	return (
		<Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-gray-200">
			<CardHeader className="text-center">
				<div className="flex justify-center mb-4">
					<img
						src={office.logo_url}
						alt={office.name}
						className="w-16 h-16 object-contain rounded-lg shadow-md"
					/>
				</div>
				<CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
					{office.name}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Address Info */}
				<div className="space-y-2">
					<div className="flex items-start gap-2 text-sm text-gray-600">
						<MapPin className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" />
						<div>
							<p className="font-medium">{office.street}</p>
							<p>
								{office.zip_code} {office.city}
							</p>
							<p className="text-gray-500">{office.country}</p>
						</div>
					</div>
				</div>

				{/* Action Button */}
				<Button className="w-full group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
					<Link
						to="/offices/$officeId"
						params={{ officeId: office.id }}
						className="flex items-center justify-center gap-2 w-full"
						preload="viewport"
					>
						<Users className="w-4 h-4" />
						Voir les restaurants
						<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
					</Link>
				</Button>
			</CardContent>
		</Card>
	);
};

export default OfficesCard;
