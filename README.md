# 🍴 Midi-Mealy

**Trouve et note les meilleurs restaurants autour de ton bureau avec tes collègues !**

Application full-stack construite avec TanStack Start, PostgreSQL et React-Leaflet pour gérer les avis et la géolocalisation des restaurants.

---

## ✨ Fonctionnalités

- 🗺️ **Carte interactive** avec React-Leaflet
- ⭐ **Système de notation** 1-5 étoiles + commentaires
- 📍 **Calcul de distance** depuis votre position
- 🔍 **Recherche & filtres** (nom, tags, distance, note)
- 🏪 **Base de données PostgreSQL** avec Drizzle ORM
- 🚀 **SSR** avec TanStack Start
- 🎨 **UI moderne** avec Shadcn/ui + Tailwind CSS

---

## 🚀 Quick Start

### Prérequis

- Node.js 18+
- PostgreSQL 14+ (ou Docker)
- npm/pnpm

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/TON_USERNAME/Midi-Mealy.git
cd Midi-Mealy

# 2. Installer les dépendances
npm install --legacy-peer-deps

# 3. Lancer PostgreSQL avec Docker
docker-compose up -d

# 4. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec ta DATABASE_URL

# 5. Générer et appliquer les migrations
npm run db:generate
npm run db:migrate

# 6. Lancer l'application
npm run dev
```

L'application sera accessible sur **http://localhost:3000** 🎉

---

## 📦 Scripts disponibles

```bash
npm run dev          # Lance le serveur de développement
npm run build        # Build l'application pour la production
npm run start        # Lance l'application en production
npm run db:generate  # Génère les migrations Drizzle
npm run db:migrate   # Applique les migrations
npm run db:push      # Push direct sans migration (dev only)
npm run db:studio    # Ouvre Drizzle Studio (UI base de données)
npm run check        # Lint + format avec Biome
```

---

## 🗄️ Base de données

### Schéma

- **users** : Utilisateurs (nom, email)
- **restaurants** : Restaurants (nom, adresse, lat/lng, cuisine, tags, moyenne)
- **reviews** : Avis (rating 1-5, commentaire, user, restaurant)

### Migrations

```bash
# Générer les migrations après modification du schéma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Voir la BDD avec Drizzle Studio
npm run db:studio
```

---

## 🐳 Déploiement sur Dokploy

### Étapes rapides

1. **Créer une base PostgreSQL** dans Dokploy
2. **Créer une application Docker** depuis GitHub
3. **Ajouter les variables d'environnement** :
   ```env
   DATABASE_URL=postgres://user:pass@host:5432/midimealy
   NODE_ENV=production
   PORT=3000
   ```
4. **Déployer** et les migrations s'appliqueront automatiquement !

📚 **Guide complet** : Voir [DEPLOIEMENT.md](./DEPLOIEMENT.md)

---

## 🛠️ Stack Technique

| Technologie | Usage |
|-------------|-------|
| **TanStack Start** | Framework full-stack React |
| **React 18** | UI Library |
| **TypeScript** | Langage |
| **PostgreSQL** | Base de données |
| **Drizzle ORM** | ORM type-safe |
| **React-Leaflet** | Carte interactive |
| **Shadcn/ui** | Composants UI |
| **Tailwind CSS** | Styling |
| **Zod** | Validation |
| **Dokploy** | Déploiement |

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
