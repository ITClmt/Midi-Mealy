import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
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
	return (
		<html lang="fr">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
