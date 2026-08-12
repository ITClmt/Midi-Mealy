# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Employés de bureau ("office") qui doivent décider où déjeuner à proximité de leur lieu de travail, en s'appuyant sur les avis de leurs propres collègues plutôt que sur des inconnus. Tous les membres d'un office partagent la même expérience produit ; le rôle manager/moderator/member est une distinction de permissions techniques (gestion de l'office, des codes d'invitation), pas une audience de conception distincte — pas d'écrans ou de parcours pensés spécifiquement "pour les admins".

## Product Purpose

Aider les équipes de bureau à trouver et choisir rapidement un restaurant pour le déjeuner, en combinant une découverte géolocalisée des restaurants (carte interactive, recherche) avec des notes et avis laissés par les collègues du même bureau. Le succès se mesure à la rapidité avec laquelle une équipe passe de "on mange où ?" à une décision.

## Positioning

Le mécanisme différenciant n'est pas la carte ni la base de restaurants (qui vient d'OpenStreetMap, une source ouverte et donc incomplète par endroits) — c'est le fait que les notes/avis proviennent exclusivement de collègues du même office. C'est cette proximité sociale et géographique qui rend un avis fiable, contrairement à Google Maps, TripAdvisor ou un sondage volatile sur Slack/Teams qui se perd dans le fil de discussion.

## Operating Context

- Un utilisateur rejoint un "office" (bureau), géolocalisé via une adresse (lat/lng), en accès libre ("open") ou via code d'invitation ("code_required").
- Les restaurants affichés proviennent de l'API Overpass (OpenStreetMap) dans un rayon autour de l'office, mis en cache côté serveur (2h) pour éviter les appels répétés.
- Deux modes de découverte : liste/recherche filtrée, et carte interactive (Leaflet).
- Chaque restaurant (identifié par un id OSM) peut recevoir des avis notés de 1 à 5 par les membres de l'office.
- Le moment d'usage typique est court et pendant la journée de travail : un coup d'œil rapide pour trancher la pause déjeuner, pas une session de recherche approfondie façon guide touristique.

## Capabilities and Constraints

- Données restaurants issues d'OpenStreetMap via Overpass — couverture et qualité dépendent de ce que la communauté OSM a renseigné localement ; des trous de données sont normaux et ne doivent pas être présentés comme un défaut à masquer.
- Pas d'app native : web uniquement (TanStack Start).
- L'appartenance à un office peut être ouverte ou restreinte par code ; les rôles manager/moderator/member existent techniquement mais ne doivent pas être traités comme des personas distincts en conception.
- Un utilisateur peut appartenir à plusieurs offices mais n'a qu'un office "affiché" par défaut (display_office_id).

## Brand Commitments

- Nom : **Midi-Mealy** (jeu de mots "Midi" = pause déjeuner + "Meal").
- Accroche déjà en place : "Trouve ton resto du midi avec tes collègues".
- Ton : informel et direct, tutoiement, français.
- Couleur d'accent déjà établie dans le produit : dégradé ambre → orange (utilisé pour les pins de la carte et les badges "meilleur resto"), à traiter comme la couleur signature de la marque plutôt qu'une couleur système générique.

## Evidence on Hand

Projet personnel, pré-lancement : aucune équipe réelle ne l'utilise encore, aucun témoignage, aucune étude de cas, aucun chiffre d'usage réel. Le travail futur ne doit fabriquer ni témoignages, ni logos d'entreprises clientes, ni statistiques d'usage — rester factuel ou explicitement présenter le produit comme nouveau/en beta (le badge "v1.0 Beta" déjà présent va dans ce sens).

## Product Principles

1. La confiance vient de la proximité, pas de l'échelle — un avis ne vaut que parce qu'il vient de quelqu'un qui travaille et déjeune réellement dans le même coin.
2. La vitesse de décision prime sur l'exhaustivité de la découverte — raccourcir "on mange où" à un coup d'œil, pas transformer l'app en guide gastronomique.
3. L'office est l'unité de confiance, pas l'individu — c'est l'appartenance à un bureau partagé qui donne du sens aux avis, pas le profil personnel.
4. Honnêteté sur la donnée : les restaurants viennent d'OSM, une source communautaire — assumer les manques plutôt que prétendre à une couverture exhaustive type Google.
5. Un seul parcours pour tous les membres — ne pas complexifier l'expérience pour distinguer manager/membre au-delà des écrans de gestion strictement nécessaires.
