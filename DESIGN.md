---
name: Midi-Mealy
description: Trouve ton resto du midi avec tes collègues
colors:
  surface: "oklch(1 0 0)"
  surface-foreground: "oklch(0.141 0.005 285.823)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.141 0.005 285.823)"
  primary: "oklch(0.21 0.006 285.885)"
  primary-foreground: "oklch(0.985 0 0)"
  secondary: "oklch(0.967 0.001 286.375)"
  secondary-foreground: "oklch(0.21 0.006 285.885)"
  muted: "oklch(0.967 0.001 286.375)"
  muted-foreground: "oklch(0.552 0.016 285.938)"
  accent-surface: "oklch(0.967 0.001 286.375)"
  destructive: "oklch(0.577 0.245 27.325)"
  border: "oklch(0.92 0.004 286.32)"
  ring: "oklch(0.871 0.006 286.286)"
  highlighter-start: "#fbbf24"
  highlighter: "#f97316"
  highlighter-deep: "#ea580c"
  locator-start: "#6366f1"
  locator-end: "#9333ea"
  status-success: "#16a34a"
  status-success-surface: "#dcfce7"
  status-danger: "#dc2626"
  status-rating: "#facc15"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.highlighter}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.highlighter-deep}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.surface-foreground}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "36px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.lg}"
    padding: "24px"
  badge-outline:
    backgroundColor: "transparent"
    textColor: "{colors.surface-foreground}"
    rounded: "{rounded.sm}"
    padding: "2px 10px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.surface-foreground}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 12px"
---

# Design System: Midi-Mealy

## Overview

**Creative North Star: "Le tableau d'affichage du bureau"**

Midi-Mealy se pense comme le panneau d'affichage d'une salle de pause : un support commun où l'équipe épingle les bonnes adresses, pas une vitrine marketing ni un guide gastronomique. L'interface reste épurée et utilitaire — on y va pour trancher vite, pas pour flâner. Chaque élément a un rôle fonctionnel avant d'être décoratif : l'orange sert à surligner ce qui mérite l'attention (un CTA, le resto le mieux noté), jamais à décorer une surface au repos.

La densité reste basse à modérée : de l'air autour du contenu, des cards nettes sur fond blanc, une hiérarchie typographique simple (titre, corps, label) sans étagement excessif. Rejets confirmés : pas d'esthétique SaaS d'entreprise froide et générique, pas de fioritures gratuites, pas de gimmicks ludiques plaqués sur l'interface — la personnalité vient de la clarté et de la justesse fonctionnelle, pas de l'ornement.

**Key Characteristics:**
- Base neutre et achromatique (grille de gris oklch) qui laisse toute la place à un seul accent chromatique fort.
- L'orange (« Surligneur ») est rare et intentionnel : il marque ce qui doit attirer l'œil, jamais une surface entière.
- Les cards sont plates au repos ; l'ombre n'apparaît qu'en réponse à une interaction (survol), jamais comme décor permanent.
- Les composants sont rangés et sans fioriture : padding généreux mais discipliné, coins doux et cohérents (rayon 6–14px), pas d'effets superflus.

## Colors

Palette globalement achromatique (grille de gris neutre, sans teinte de marque dans les tokens système), sur laquelle un unique accent chromatique fort — l'orange — porte toute l'identité de marque. Une seconde couleur, l'indigo/violet, existe mais est cantonnée à un rôle purement fonctionnel sur la carte.

### Primary
- **Surligneur** (`#fbbf24` → `#f97316`, dégradé ambre vers orange) : la couleur de marque. Utilisée pour le bouton d'action principal (créer un compte / CTA), les pins de restaurants sur la carte, et le badge du restaurant le mieux noté d'un classement. Au survol, le dégradé s'assombrit vers `#ea580c` (« Surligneur profond »). Sa rareté est ce qui lui donne son pouvoir : elle n'apparaît que là où une action ou un signal fort est attendu.

### Secondary
- **Punaise repère** (`#6366f1` → `#9333ea`, indigo vers violet) : uniquement le marqueur « votre bureau » sur la carte interactive. Rôle strictement fonctionnel de repérage géographique, jamais réutilisé ailleurs dans l'interface (pas sur des boutons, badges ou textes). Ne pas laisser cette couleur s'échapper de la carte.

### Tertiary
Couleurs de signal fonctionnel, appliquées directement en utilitaires Tailwind plutôt que tokenisées — à traiter comme des couleurs de statut, pas comme des accents de marque.
- **Succès** (`#16a34a` sur fond `#dcfce7`) : confirmation positive (ex. « N restaurants trouvés », code d'invitation actif).
- **Alerte** (`#dc2626`) : états négatifs ou expirés (ex. badge « Expiré »). Coexiste avec le token `destructive` (`oklch(0.577 0.245 27.325)`) utilisé par les composants shadcn (boutons destructifs) sans le réutiliser directement — deux sources de rouge en parallèle, à ne pas unifier sans décision explicite.
- **Notation** (`#facc15`) : remplissage des étoiles de notation (1 à 5), jamais utilisée hors du contexte de rating.

### Neutral
- **Fond** (`oklch(1 0 0)`, blanc) : fond de page et des cards par défaut.
- **Encre** (`oklch(0.141 0.005 285.823)`) : texte principal.
- **Secondaire/Muted** (`oklch(0.967 0.001 286.375)`) : fonds discrets (badges neutres, hover de navigation, sections `bg-muted/30`).
- **Texte atténué** (`oklch(0.552 0.016 285.938)`) : texte secondaire, légendes, métadonnées.
- **Bordure** (`oklch(0.92 0.004 286.32)`) : séparateurs et contours de cards/inputs.
- **Primary (achromatique)** (`oklch(0.21 0.006 285.885)`, quasi-noir) : le token shadcn `primary` par défaut — utilisé pour le texte/fond à fort contraste (badges de statut, hover d'état actif en navigation via `primary/10`). Ne pas confondre avec le « Surligneur » orange : ce noir/blanc est le primary *système*, l'orange est le primary *de marque* pour les CTA.

### Named Rules
**La règle du Surligneur Rare.** L'orange n'occupe jamais une surface large au repos (pas de fond de page, pas de fond de card par défaut) — il marque un point précis : un bouton d'action, un pin, un badge de classement. S'il apparaît partout, il ne signale plus rien.

**La règle de la Punaise Isolée.** L'indigo/violet ne quitte jamais la carte interactive. S'il apparaît sur un bouton, un badge ou du texte ailleurs dans le produit, c'est une régression à corriger.

## Typography

**Display Font:** Police système (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) — pas de police custom chargée.
**Body Font:** Même pile système, pas de police distincte pour le corps de texte.

**Character:** Une seule famille système du haut en bas de la hiérarchie — cohérent avec le parti pris utilitaire : le rythme visuel vient du poids et de la taille, pas d'un changement de police.

### Hierarchy
- **Display** (700, `clamp(2.25rem, 5vw, 3.75rem)`, line-height 1.1, letter-spacing -0.02em) : titre du hero de la landing page, seul endroit où le texte atteint cette échelle.
- **Heading** (600–700, 1.125–1.5rem) : titres de card, titres de section (`CardTitle`, `h2`/`h3`).
- **Body** (400, 0.875rem) : texte courant, descriptions, contenu de formulaire.
- **Label** (500, 0.7–0.75rem) : libellés de navigation mobile, badges de statut, métadonnées de card (ex. « Expire le… »).

### Named Rules
**La règle de la Police Unique.** Aucune police d'accent ou display séparée n'est introduite ; toute la hiérarchie se construit avec la même pile système via poids et taille.

## Layout

Grille de contenu centrée avec `container mx-auto px-4`, sans grille CSS complexe : la plupart des sections empilent des blocs verticaux (`space-y-*`) ou des grilles simples 2-3 colonnes (`grid sm:grid-cols-3`) qui repassent en une colonne sous le breakpoint `sm`. Rythme de section généreux sur la landing page (`py-16` à `py-20`, soit 64–80px), plus resserré dans l'app (`p-4`, `p-6`).

Navigation à deux échelles : un rail vertical icône-seule de 64px (`w-16`) sur desktop, remplacé par une barre d'onglets fixe en bas d'écran (`h-16`) sur mobile — jamais les deux en même temps. La barre supérieure (`TopNavbar`) reste fixe en hauteur (`h-14`) sur toutes les tailles d'écran.

## Elevation & Depth

**Plat par défaut, lève au survol.** Les cards et surfaces interactives n'ont pas d'ombre à l'état de repos — la séparation vient de la bordure (`border`) et du fond neutre. L'ombre n'apparaît qu'en réponse à une interaction : survol d'une `OfficesCard` (`hover:shadow-2xl` + léger décalage vers le haut `hover:-translate-y-2`), survol d'un pin resto sur la carte (`hover:scale-110`), survol d'une card de classement (`hover:scale-105`). L'ombre est un signal de « ceci est cliquable/vivant », pas un décor permanent.

### Shadow Vocabulary
- **Repos** (`shadow-none` / bordure seule) : état par défaut de la majorité des cards et inputs.
- **Élévation légère** (`shadow-sm` / `shadow-md`) : logo d'office, popups de carte — un léger détachement du fond.
- **Élévation de survol** (`shadow-lg` / `shadow-2xl`) : réponse au survol sur les cards cliquables (`OfficesCard`) et le classement des restaurants (`ReviewCard`).

### Named Rules
**La règle de l'Ombre Méritée.** Une ombre ne s'affiche que si l'utilisateur vient de faire quelque chose (survol, focus) ou si l'élément flotte réellement au-dessus du flux (popup de carte). Une card statique dans une liste n'a pas d'ombre par défaut.

## Shapes

Coins doux et cohérents dérivés d'un seul rayon de base (`--radius: 0.625rem` / 10px) : `sm` 6px (badges, petits boutons icône), `md` 8px (boutons, inputs), `lg` 10px (cards), `xl` 14px (blocs mis en avant, icône du hero). Les éléments de statut et de navigation active utilisent des formes pleinement arrondies (`rounded-full`) pour se distinguer visuellement des cards/boutons rectangulaires — pilule de succès, badges ronds sur la carte, cercle numéroté des étapes « Comment ça marche ». Pas de coins vifs (0px) ni de découpes asymétriques dans le système actuel.

## Components

### Buttons
- **Shape:** rayon `md` (8px), hauteur standard 36px (`h-9`).
- **Primary (marque):** fond dégradé Surligneur (`#fbbf24` → `#f97316`), texte blanc, ombre douce teintée orange (`shadow-orange-500/25`). Réservé aux actions principales de conversion (CTA landing page « Créer un compte », « Commencer gratuitement »).
- **Default (système):** fond `primary` achromatique quasi-noir, texte blanc — utilisé pour les actions internes à l'app (formulaires, actions de gestion) où la marque orange n'a pas besoin d'être engagée.
- **Outline:** fond transparent, bordure `border`, texte `foreground` — action secondaire à côté d'un primary (« Se connecter » à côté de « Créer un compte »).
- **Ghost / icon:** sans fond ni bordure au repos, `hover:bg-accent-surface` — utilisé pour les actions denses en liste (copier/révoquer/supprimer un code d'invitation).
- **Hover / Focus:** transition de couleur douce (`transition-all`), anneau de focus visible `ring-ring/50` à 3px — pas d'effet de lift sur les boutons eux-mêmes (le lift est réservé aux cards).

### Badges
- **Style:** petites pilules à bordure (`variant="outline"`, rayon `sm`, padding 2px 10px), fond transparent par défaut.
- **État de statut:** la couleur de texte/bordure change selon le statut (vert = actif, orange = désactivé, rouge = expiré, gris = neutre) sans jamais remplir le fond — le badge reste léger visuellement.

### Cards / Containers
- **Corner Style:** rayon `lg` (10px).
- **Background:** `card` (blanc).
- **Shadow Strategy:** voir Elevation & Depth — plat au repos, ombre au survol pour les cards cliquables.
- **Border:** bordure fine `border` par défaut ; les cards de destination cliquables (`OfficesCard`) passent à `border-2` et teintent la bordure vers `primary` au survol.
- **Internal Padding:** 24px (`p-6`) en standard.

### Inputs / Fields
- **Style:** fond transparent, bordure `input`/`border`, rayon `md`, ombre très légère au repos (`shadow-xs`).
- **Focus:** bordure qui passe à `ring` et anneau externe de 3px (`ring-ring/50`) — pas d'effet de glow coloré.
- **Error:** anneau et bordure teintés `destructive` (`aria-invalid`).

### Navigation
- **Rail desktop:** icônes seules dans des tuiles `48×48px` arrondies (`rounded-xl`), état actif = fond `primary/10` + icône `primary` ; état inactif = icône `muted-foreground`, `hover:bg-muted`.
- **Barre mobile:** même logique en bas d'écran fixe, icône + label 10px, actif = icône `primary` sans fond de tuile.
- **Barre supérieure:** logo + wordmark à gauche, liens texte discrets à droite (`text-muted-foreground`, `hover:text-foreground`), aucun état actif visuel distinct.

### Pin de restaurant (composant signature)
Marqueur circulaire (`32×32px`) au dégradé Surligneur avec icône assiette, bordure blanche 2px, pointe triangulaire orange en dessous, léger scale au survol (`hover:scale-110`) — c'est le point de contact visuel principal entre la marque et la carte OpenStreetMap. Le popup associé reste blanc/neutre avec deux chips orange clair (`bg-amber-50 text-amber-700`) pour cuisine et note, puis un bouton CTA au dégradé Surligneur pour « laisser un avis ».

### Card de classement (composant signature)
Card blanche à bordure orange très claire (`border-orange-100`), badge de rang en dégradé orange→rouge collé au coin supérieur droit (variation ponctuelle du Surligneur réservée à ce contexte de compétition/classement), étoiles jaunes de notation, légère mise à l'échelle au survol (`hover:scale-105`). C'est la seule surface où deux teintes chaudes différentes (orange et rouge) coexistent dans un même dégradé — traiter comme une exception délibérée pour le podium, pas un précédent à généraliser.

## Do's and Don'ts

### Do:
- **Do** réserver l'orange (Surligneur) aux actions et signaux qui comptent vraiment : CTA principal, pins de restaurant, badge du meilleur resto.
- **Do** garder les cards plates au repos et ne faire apparaître l'ombre qu'en réponse au survol ou au focus.
- **Do** utiliser un rayon cohérent avec l'échelle existante (6 / 8 / 10 / 14px) plutôt que d'introduire une nouvelle valeur.
- **Do** garder l'indigo/violet strictement confiné au marqueur « votre bureau » sur la carte.

### Don't:
- **Don't** étendre l'orange à des fonds de page ou de card entiers — il perd son pouvoir de signal s'il devient une couleur d'ambiance.
- **Don't** réutiliser l'indigo/violet du pin de bureau sur un bouton, un badge ou un texte hors de la carte.
- **Don't** introduire une nouvelle police d'accent ou display : la hiérarchie se fait par poids/taille sur la pile système existante.
- **Don't** ajouter de décoration purement ornementale (illustrations, motifs de fond, gradients larges) sur les surfaces utilitaires de l'app — c'est un tableau d'affichage fonctionnel, pas une vitrine marketing.
