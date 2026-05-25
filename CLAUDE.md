# Midi-Mealy

Application de découverte de restaurants pour équipes de bureau. Les utilisateurs rejoignent un bureau (office), voient les restaurants à proximité via OpenStreetMap, et laissent des avis.

## Commandes essentielles

```bash
npm run dev          # Dev server sur localhost:3000
npm run build        # Build de production
npm run start        # Lance le build (.output/server/index.mjs)
npm run check        # Biome lint + format (à lancer avant commit)
npm run test         # Vitest
npm run docker:up    # Docker compose (build + start)
```

> Installation : `npm install --legacy-peer-deps` (conflits de peer deps React 19)

## Stack technique

- **TanStack Start** 1.132.0 — framework SSR full-stack
- **TanStack Router** 1.132.0 — routing file-based avec génération automatique
- **TanStack Query** 5.66.5 — state serveur / cache côté client
- **React** 19 + TypeScript 5.7 strict
- **Supabase** — auth + base de données PostgreSQL (via PostgREST)
- **Tailwind CSS** v4 + Shadcn/ui + Radix UI
- **Biome** — linter + formatter (tabs, double quotes)
- **Leaflet / React-Leaflet** — cartes interactives
- **APIs externes** : Nominatim (geocoding), Overpass API (restaurants OSM)

## Architecture

```
src/
├── routes/           # Pages (file-based routing, auto-généré dans routeTree.gen.ts)
├── services/         # Toute la logique serveur — createServerFn() uniquement
│   ├── auth/
│   ├── offices/
│   ├── restaurants/
│   ├── reviews/
│   ├── officeMember/
│   ├── officeCode/
│   ├── geocoding/
│   └── schemas.ts    # Schémas Zod partagés
├── components/       # Composants React (ui/, layout/, offices/, restaurants/, reviews/, auth/)
├── hooks/            # Hooks personnalisés
├── lib/
│   ├── db/supabase.ts  # Factory du client Supabase SSR
│   ├── utils.ts        # cn(), normalizeText()
│   └── errors.ts
└── integrations/tanstack-query/  # Setup React Query + devtools
```

## Pattern server functions

Tout appel base de données ou API externe passe par `createServerFn()` — jamais depuis le client directement.

```typescript
// src/services/xxx/xxx.api.ts
export const myFn = createServerFn({ method: "POST" })
  .inputValidator(MyZodSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient(); // toujours SSR
    const { data: result, error } = await supabase.from("table").select();
    if (error) throw new Error(error.message);
    return result;
  });
```

## Client Supabase

`getSupabaseServerClient()` dans `src/lib/db/supabase.ts` — crée un client SSR avec cookies via `getCookies()` / `setCookie()` de TanStack Start. Ne jamais créer de client Supabase côté browser dans ce projet.

## Auth

- Géré entièrement côté serveur via `src/services/auth/auth.api.ts`
- `getUser()` est appelé dans `__root.tsx` `beforeLoad` → injecté dans le context router comme `authState`
- Structure `authState` : `{ isAuthenticated: boolean, user: { email, id, meta: { username, display_office_id } } }`
- Pas de store global : l'état auth se lit depuis `Route.useRouteContext()` dans chaque route

## Routes importantes

| Route | Description |
|-------|-------------|
| `/` | Login / Signup (redirige vers `/offices` si connecté) |
| `/offices` | Liste des bureaux |
| `/offices/$officeId` | Detail bureau + liste restaurants + carte |
| `/offices/$officeId/search` | Recherche restaurants |
| `/offices/$officeId/map` | Vue carte |
| `/restaurant/$restaurantId` | Fiche restaurant + avis |
| `/profile/$userId` | Profil utilisateur |

`routeTree.gen.ts` est auto-généré par TanStack Router — ne pas modifier manuellement.

## Base de données (Supabase)

Tables principales :
- **offices** — bureaux avec géolocalisation (lat/lng, manager_id, join_policy)
- **office_members** — membres par bureau (role: manager/moderator/member)
- **office_invite_codes** — codes d'invitation (expiration, max_uses, uses_count)
- **reviews** — avis restaurants (rating 1-5, restaurant_id au format `osm_${id}`)
- **osm_restaurants_cache** — cache des restaurants OSM (TTL 2h, nettoyage via pg_cron)

RPC Supabase utilisées : `increment_invite_code_uses`, `revoke_invite_code`, `reactivate_invite_code`, `delete_invite_code`, `get_user_display_offices`.

Les policies RLS Supabase doivent être configurées manuellement dans le dashboard Supabase.

## Variables d'environnement

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
NODE_ENV=development
PORT=3000
```

Les variables `VITE_` sont exposées au browser. Le client Supabase serveur utilise les mêmes variables (lues côté server function via l'env Vite).

## Conventions

- **Alias** : `@/` → `src/`
- **Formatting** : tabs, double quotes (Biome)
- **Validation** : Zod sur toutes les inputs de server functions
- **Icônes** : Lucide React uniquement
- **Composants UI** : Shadcn/ui (dans `src/components/ui/`) — ne pas modifier directement
- **Classes CSS** : `cn()` de `@/lib/utils` pour combiner les classnames Tailwind

## Cache & performance

- Restaurants OSM : cache 2h dans `osm_restaurants_cache` (évite les appels répétés à Overpass)
- React Query : `staleTime` 5min pour restaurants, 2min pour ratings
- Overpass API : timeout 30s, max 1000 résultats, rayon 10-10 000m
- Geocoding Nominatim : pas de cache (appel unique à la création d'un bureau)
