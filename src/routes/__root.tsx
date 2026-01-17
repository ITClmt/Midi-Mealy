import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import { Bounce, ToastContainer } from "react-toastify";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { getUser } from "@/services/auth/auth.api";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async () => {
		try {
			const user = await getUser();
			if (user?.isAuthenticated) {
				return {
					authState: {
						isAuthenticated: true,
						user: user.user,
					},
				};
			}
		} catch (error) {
			console.error("Error getting user:", error);
		}

		return {
			authState: {
				isAuthenticated: false,
				user: null,
			},
		};
	},
	notFoundComponent: () => (
		<div className="flex flex-col items-center justify-center min-h-screen p-4">
			<h1 className="text-4xl font-bold mb-4">404</h1>
			<p className="text-xl text-muted-foreground mb-8">Page non trouvée</p>
			<Link
				to="/"
				className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
			>
				Retour à l'accueil
			</Link>
		</div>
	),
	head: () => ({
		meta: [
			// Encodage et titre
			{ charSet: "utf-8" },
			{ title: "Midi-Mealy - Trouve ton resto du midi avec tes collègues" },

			// Métadonnées de base
			{
				name: "description",
				content:
					"Midi-Mealy est une application de référencement de restaurants autour de ton bureau avec tes collègues.",
			},
			{
				name: "keywords",
				content:
					"restaurant, bureau, collègue, note, avis, distance, recherche",
			},
			{
				name: "author",
				content: "Clément ANDREANI - @ITClement",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},

			// Directives pour les robots d'indexation
			{
				name: "robots",
				content: "index, follow",
			},
			{
				name: "googlebot",
				content: "index, follow",
			},
			{
				name: "bingbot",
				content: "index, follow",
			},
			{
				name: "yahoobot",
				content: "index, follow",
			},
			{
				name: "duckduckbot",
				content: "index, follow",
			},
			{
				name: "baiduspider",
				content: "index, follow",
			},
			{
				name: "yandexbot",
				content: "index, follow",
			},
			{
				name: "naverbot",
				content: "index, follow",
			},

			// Open Graph (réseaux sociaux)
			{
				property: "og:title",
				content: "Midi-Mealy - Trouve ton resto du midi avec tes collègues",
			},
			{
				property: "og:description",
				content:
					"Midi-Mealy est une application de référencement de restaurants autour de ton bureau avec tes collègues.",
			},
			{
				property: "og:url",
				content: "https://www.midi-mealy.xyz",
			},
			{
				property: "og:site_name",
				content: "Midi-Mealy",
			},
			{
				property: "og:locale",
				content: "fr_FR",
			},
			{
				property: "og:type",
				content: "website",
			},

			// Twitter Card (pour les partages sur X/Twitter)
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
			{
				name: "twitter:title",
				content: "Midi-Mealy - Trouve ton resto du midi avec tes collègues",
			},
			{
				name: "twitter:description",
				content:
					"Midi-Mealy est une application de référencement de restaurants autour de ton bureau avec tes collègues.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const { authState } = Route.useRouteContext();

	return (
		<html lang="fr">
			<head>
				<HeadContent />
			</head>
			<body>
				<div className="min-h-screen bg-background flex flex-col">
					<TopNavbar
						isAuthenticated={authState?.isAuthenticated}
						username={authState?.user?.meta?.username || authState?.user?.email}
						userId={authState?.user?.id}
					/>
					<main className="flex-1 overflow-auto">{children}</main>
				</div>
				<Scripts />
				<ToastContainer
					position="top-right"
					autoClose={4000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick={false}
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="light"
					transition={Bounce}
				/>
			</body>
		</html>
	);
}
