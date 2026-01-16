import { createFileRoute } from "@tanstack/react-router";
import { UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignupForm";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [isLogin, setIsLogin] = useState(true);

	const toggleMode = () => {
		setIsLogin(!isLogin);
	};

	return (
		<main className="min-h-screen bg-background flex flex-col justify-center">
			<section className="container mx-auto px-4 py-16">
				<div className="max-w-3xl mx-auto text-center space-y-8">
					{/* Logo & Badge */}
					<div className="flex flex-col items-center gap-6">
						<div className="p-4 bg-primary/10 rounded-2xl text-primary">
							<UtensilsCrossed className="w-12 h-12" />
						</div>
						<Badge variant="outline" className="text-sm px-3 py-1 font-normal">
							v1.0 Beta
						</Badge>
					</div>
					{isLogin ? (
						<LoginForm onToggleMode={toggleMode} showToggle />
					) : (
						<SignUpForm onToggleMode={toggleMode} showToggle />
					)}
				</div>
			</section>
		</main>
	);
}
