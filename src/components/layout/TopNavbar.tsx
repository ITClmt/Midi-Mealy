import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut, UtensilsCrossed } from "lucide-react";
import { signOut } from "@/services/auth/auth.api";

interface TopNavbarProps {
	isAuthenticated?: boolean;
	username?: string;
	userId?: string;
}

export function TopNavbar({
	isAuthenticated,
	username,
	userId,
}: TopNavbarProps) {
	const navigate = useNavigate();

	const handleLogout = async () => {
		await signOut();
		navigate({ to: "/" });
	};

	return (
		<header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 lg:px-6">
			{/* Logo */}
			<Link to="/" className="flex items-center gap-2">
				<div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
					<UtensilsCrossed className="w-5 h-5 text-primary" />
				</div>
				<span className="font-semibold text-foreground hidden sm:block">
					Midi-Mealy
				</span>
			</Link>

			{/* Right side */}
			<div className="flex items-center gap-4">
				<Link
					to="/offices"
					className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					Bureaux
				</Link>

				{isAuthenticated ? (
					<>
						{username && (
							<Link
								to="/profile/$userId"
								params={{ userId: userId || "" }}
								className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								{username}
							</Link>
						)}
						<button
							type="button"
							onClick={handleLogout}
							className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							<LogOut className="w-4 h-4" />
							<span className="hidden sm:block">Déconnexion</span>
						</button>
					</>
				) : (
					<Link
						to="/"
						className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<LogIn className="w-4 h-4" />
						<span className="hidden sm:block">Connexion</span>
					</Link>
				)}
			</div>
		</header>
	);
}
