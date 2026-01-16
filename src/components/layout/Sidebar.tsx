import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Map as MapIcon, Search, User } from "lucide-react";

interface SidebarProps {
	officeId: string;
	userId?: string;
}

interface NavItem {
	to:
		| "/offices/$officeId"
		| "/offices/$officeId/search"
		| "/offices/$officeId/map"
		| "/profile/$userId";
	params: { officeId: string } | { userId: string };
	icon: React.ReactNode;
	label: string;
	isActive: boolean;
	hidden?: boolean;
}

export function Sidebar({ officeId, userId }: SidebarProps) {
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;

	// Les routes sont relatives à l'office actuel
	const navItems: NavItem[] = [
		{
			to: "/offices/$officeId",
			params: { officeId },
			icon: <Home className="w-5 h-5" />,
			label: "Restaurants",
			isActive: currentPath === `/offices/${officeId}`,
		},
		{
			to: "/offices/$officeId/search",
			params: { officeId },
			icon: <Search className="w-5 h-5" />,
			label: "Recherche",
			isActive: currentPath.includes("/search"),
		},
		{
			to: "/offices/$officeId/map",
			params: { officeId },
			icon: <MapIcon className="w-5 h-5" />,
			label: "Carte",
			isActive: currentPath.includes("/map"),
		},
		...(userId
			? [
					{
						to: "/profile/$userId" as const,
						params: { userId },
						icon: <User className="w-5 h-5" />,
						label: "Profil",
						isActive: currentPath.startsWith("/profile"),
						hidden: false,
					},
				]
			: []),
	];

	// Filtrer les items cachés
	const visibleItems = navItems.filter((item) => !item.hidden);

	return (
		<>
			{/* Desktop Sidebar - Left vertical */}
			<aside className="hidden md:flex flex-col w-16 bg-background border-r border-border shrink-0">
				<nav className="flex-1 py-4">
					<ul className="space-y-2 px-2">
						{visibleItems.map((item) => (
							<li key={item.to}>
								<Link
									to={item.to}
									params={
										item.params as { officeId: string } | { userId: string }
									}
									className={`
										flex flex-col items-center justify-center
										w-12 h-12 rounded-xl
										transition-all duration-200
										${
											item.isActive
												? "bg-primary/10 text-primary"
												: "text-muted-foreground hover:bg-muted hover:text-foreground"
										}
									`}
									title={item.label}
								>
									{item.icon}
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</aside>

			{/* Mobile Bottom Navigation */}
			<nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border z-50">
				<ul className="flex items-center justify-around h-full px-4">
					{visibleItems.map((item) => (
						<li key={item.to}>
							<Link
								to={item.to}
								params={
									item.params as { officeId: string } | { userId: string }
								}
								className={`
									flex flex-col items-center justify-center gap-1
									w-14 h-14 rounded-xl
									transition-all duration-200
									${item.isActive ? "text-primary" : "text-muted-foreground"}
								`}
							>
								{item.icon}
								<span className="text-[10px] font-medium">{item.label}</span>
							</Link>
						</li>
					))}
				</ul>
			</nav>
		</>
	);
}
