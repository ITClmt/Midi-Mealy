# 🔄 Migration vers Supabase - Récapitulatif

## ✅ Ce qui a été fait

### 1. Suppression de l'infrastructure PostgreSQL locale
- ❌ Conteneurs Docker PostgreSQL supprimés
- ❌ Fichiers de configuration Drizzle supprimés (`drizzle.config.ts`, dossier `drizzle/`)
- ❌ Scripts de migration automatique retirés (`start.sh`, `db:migrate`, etc.)
- ❌ Dépendances PostgreSQL locales désinstallées (`pg`, `postgres`, `drizzle-orm`, `drizzle-kit`)

### 2. Configuration Supabase ajoutée
- ✅ Client Supabase installé (`@supabase/supabase-js`)
- ✅ Fichier de configuration créé (`src/lib/db/supabase.ts`)
- ✅ Schéma SQL préparé (`supabase-schema.sql`)
- ✅ Exemples d'utilisation documentés (`src/lib/db/example-usage.ts`)
- ✅ Guide de configuration complet (`SUPABASE_SETUP.md`)

### 3. Documentation mise à jour
- ✅ README.md actualisé avec les instructions Supabase
- ✅ DEPLOIEMENT.md mis à jour pour Supabase
- ✅ Page d'accueil mise à jour (tech stack)
- ✅ Variables d'environnement avec préfixe `VITE_`

## 📋 Configuration nécessaire

### Variables d'environnement requises

Créer un fichier `.env` à la racine avec :

```env
# Supabase (obligatoire)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Application
NODE_ENV=development
PORT=3000
```

> **Note** : Le préfixe `VITE_` est nécessaire pour que Vite expose ces variables côté client.

## 🚀 Démarrage rapide

### 1. Configuration Supabase

```bash
# 1. Créer un projet sur supabase.com
# 2. Copier les credentials (Settings > API)
# 3. Exécuter supabase-schema.sql dans le SQL Editor
```

### 2. Configuration locale

```bash
# Copier le template d'environnement
cp .env.example .env

# Éditer .env avec tes credentials Supabase
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# Installer les dépendances
npm install --legacy-peer-deps

# Lancer l'application
npm run dev
```

## 📚 Utilisation du client Supabase

### Exemple simple

```typescript
import { supabase } from '@/lib/db/supabase';

// Lire tous les restaurants
const { data: restaurants, error } = await supabase
  .from('restaurants')
  .select('*')
  .order('avg_rating', { ascending: false });

// Créer un restaurant
const { data: newRestaurant, error } = await supabase
  .from('restaurants')
  .insert({
    name: 'Le Bon Restaurant',
    address: '123 rue Example',
    lat: 48.8566,
    lng: 2.3522
  })
  .select()
  .single();

// Ajouter un avis
const { data: review, error } = await supabase
  .from('reviews')
  .insert({
    restaurant_id: 1,
    user_name: 'John Doe',
    rating: 5,
    comment: 'Excellent!'
  })
  .select()
  .single();
```

Pour plus d'exemples, voir `src/lib/db/example-usage.ts`

## 🔐 Sécurité

### Row Level Security (RLS)

Le schéma SQL inclut des politiques RLS :
- **Lecture publique** : Tout le monde peut lire les restaurants et avis
- **Écriture authentifiée** : Seuls les utilisateurs authentifiés peuvent créer/modifier

### Clés API

- **ANON_KEY** : Clé publique, peut être exposée côté client (limitée par RLS)
- **SERVICE_KEY** : Clé secrète avec tous les droits (JAMAIS exposée côté client)

## 🎯 Avantages de Supabase

### Par rapport à PostgreSQL local

| Avant (PostgreSQL local) | Après (Supabase) |
|--------------------------|------------------|
| Docker à gérer | Hébergé dans le cloud |
| Migrations manuelles | Interface SQL Editor |
| Pas de backup automatique | Backups automatiques |
| Pas d'UI pour les données | Dashboard intégré |
| Configuration complexe | Setup en 5 minutes |
| Authentification à coder | Auth intégré |

### Fonctionnalités gratuites

- ✅ 500 MB de base de données
- ✅ 50,000 utilisateurs authentifiés
- ✅ 2 GB de stockage fichiers
- ✅ 50 GB de bande passante
- ✅ API auto-générée
- ✅ Realtime subscriptions
- ✅ Edge Functions

## 📖 Ressources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Fichiers du projet
- `SUPABASE_SETUP.md` : Guide de configuration détaillé
- `supabase-schema.sql` : Schéma complet de la base de données
- `src/lib/db/supabase.ts` : Client Supabase configuré
- `src/lib/db/example-usage.ts` : Exemples d'utilisation
- `.env.example` : Template des variables d'environnement

## 🆘 Troubleshooting

### Erreur : "VITE_SUPABASE_URL is not defined"
➜ Vérifie que le `.env` existe et contient les bonnes variables

### Erreur d'authentification RLS
➜ Vérifie que les politiques RLS sont bien créées dans Supabase

### Les données ne s'affichent pas
➜ Vérifie dans le Table Editor de Supabase que les tables sont créées

### Erreur CORS
➜ Ajoute ton URL dans Supabase > Settings > API > URL Configuration

## 🎉 Migration terminée !

Ton application utilise maintenant Supabase comme backend. Tu peux :
- Gérer les données via le Dashboard Supabase
- Voir les logs en temps réel
- Configurer l'authentification si besoin
- Utiliser le Storage pour les images
- Activer le Realtime pour les mises à jour en direct

Bon développement ! 🚀

