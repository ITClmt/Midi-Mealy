# 🍴 Midi-Mealy

**Trouve et note les meilleurs restaurants autour de ton bureau avec tes collègues !**

Application full-stack construite avec TanStack Start, PostgreSQL et React-Leaflet pour gérer les avis et la géolocalisation des restaurants.

---

## ✨ Fonctionnalités

- 🗺️ **Carte interactive** avec React-Leaflet
- ⭐ **Système de notation** 1-5 étoiles + commentaires
- 📍 **Calcul de distance** depuis votre position
- 🔍 **Recherche & filtres** (nom, tags, distance, note)
- 🏪 **Base de données Supabase** (PostgreSQL + API)
- 🚀 **SSR** avec TanStack Start
- 🎨 **UI moderne** avec Shadcn/ui + Tailwind CSS

---

## 🚀 Quick Start

### Prérequis

- Node.js 18+
- Un compte Supabase (gratuit)
- npm/pnpm

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/TON_USERNAME/Midi-Mealy.git
cd Midi-Mealy

# 2. Installer les dépendances
npm install --legacy-peer-deps

# 3. Configurer Supabase
# - Créer un projet sur supabase.com
# - Exécuter le script supabase-schema.sql dans le SQL Editor
# - Copier les credentials

# 4. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec tes credentials Supabase

# 5. Lancer l'application
npm run dev
```

L'application sera accessible sur **http://localhost:3000** 🎉

> 📖 Pour plus de détails sur la configuration Supabase, consulte [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

---

## 📦 Scripts disponibles

```bash
npm run dev          # Lance le serveur de développement
npm run build        # Build l'application pour la production
npm run start        # Lance l'application en production
npm run check        # Lint + format avec Biome
npm run docker:build # Build l'image Docker
npm run docker:up    # Lance l'application avec Docker
```

---

## 🗄️ Base de données (Supabase)

### Schéma

- **restaurants** : Restaurants (nom, adresse, lat/lng, note moyenne, nombre d'avis)
- **reviews** : Avis (rating 1-5, commentaire, nom utilisateur, restaurant)

Le schéma complet est disponible dans `supabase-schema.sql`. Il inclut :
- Relations avec clés étrangères et CASCADE
- Index pour optimiser les requêtes géolocalisées
- Row Level Security (RLS) configuré pour la sécurité

### Accéder à la base de données

- **Supabase Dashboard** : Interface web pour gérer les données et voir les logs
- **SQL Editor** : Exécuter des requêtes SQL directement
- **Table Editor** : Interface visuelle pour éditer les données

---

## 🐳 Déploiement

### Étapes rapides

1. **Créer un projet Supabase** sur supabase.com
2. **Exécuter le schéma SQL** dans le SQL Editor de Supabase
3. **Déployer l'application** (Vercel, Netlify, Dokploy, etc.)
4. **Ajouter les variables d'environnement** :
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   NODE_ENV=production
   PORT=3000
   ```

📚 **Guides complets** : 
- Configuration Supabase : [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- Déploiement Dokploy : [DEPLOIEMENT.md](./DEPLOIEMENT.md)

---

## 🛠️ Stack Technique

| Technologie | Usage |
|-------------|-------|
| **TanStack Start** | Framework full-stack React SSR |
| **React 19** | UI Library |
| **TypeScript** | Langage type-safe |
| **Supabase** | Backend as a Service (PostgreSQL + API) |
| **React-Leaflet** | Carte interactive avec OpenStreetMap |
| **Shadcn/ui** | Composants UI accessibles |
| **Tailwind CSS** | Utility-first CSS |
| **Zod** | Validation de schémas |
| **Biome** | Linter & formatter |

---

## 📂 Structure du projet

```
Midi-Mealy/
├── src/
│   ├── components/        # Composants React
│   │   └── ui/           # Composants Shadcn
│   ├── lib/
│   │   ├── db/           # Configuration + schéma Drizzle
│   │   │   ├── schema.ts
│   │   │   ├── config.ts
│   │   │   ├── migrate.ts
│   │   │   └── migrations/
│   │   └── utils.ts
│   ├── routes/           # Routes TanStack Router
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   └── api/          # Routes API (à venir)
│   └── styles.css
├── public/               # Assets statiques
├── Dockerfile            # Multi-stage build
├── docker-compose.yml    # PostgreSQL local
├── drizzle.config.ts     # Config Drizzle
├── package.json
└── README.md
```

---

## 🗺️ Roadmap

### ✅ Version 1.0 (MVP)

- [x] Page d'accueil avec Shadcn/ui
- [x] Schéma de base de données
- [x] Dockerfile + déploiement Dokploy
- [ ] Carte interactive Leaflet
- [ ] API restaurants (CRUD + recherche)
- [ ] API reviews (CRUD + calcul moyenne)
- [ ] Système de notation

### 🔜 Version 2.0

- [ ] Authentification utilisateurs (OAuth)
- [ ] Upload de photos
- [ ] Tags personnalisés (végétarien, terrasse, etc.)
- [ ] Favoris & listes
- [ ] Notifications
- [ ] Mode sombre

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 License

MIT

---

## 🙏 Remerciements

- [TanStack](https://tanstack.com/) pour l'excellent framework
- [Shadcn](https://ui.shadcn.com/) pour les composants UI
- [Drizzle](https://orm.drizzle.team/) pour l'ORM type-safe
- [Leaflet](https://leafletjs.com/) pour la cartographie

---

**Fait avec ❤️ pour les gourmands du bureau !** 🍴
