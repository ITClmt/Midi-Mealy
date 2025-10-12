# 🚀 Installation et Configuration de Midi-Mealy

## 📋 Prérequis

- **Node.js** 18+ et npm/pnpm
- **PostgreSQL** 14+ (ou Docker)
- **Git**

---

## 🗄️ Installation de PostgreSQL

### Option 1 : Docker (Recommandé - plus simple)

1. **Installer Docker Desktop**
   - Windows: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   - Télécharge et installe Docker Desktop

2. **Lancer PostgreSQL avec Docker**
   ```bash
   docker run --name midimealy-postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_DB=midimealy \
     -p 5432:5432 \
     -d postgres:16
   ```

3. **Vérifier que ça tourne**
   ```bash
   docker ps
   ```

4. **Pour arrêter/redémarrer plus tard**
   ```bash
   docker stop midimealy-postgres
   docker start midimealy-postgres
   ```

---

### Option 2 : Installation native sur Windows

1. **Télécharger PostgreSQL**
   - Va sur [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
   - Télécharge l'installeur (version 16 recommandée)

2. **Installer**
   - Lance l'installeur
   - Définis un mot de passe pour l'utilisateur `postgres` (note-le !)
   - Port par défaut : `5432`
   - Installe aussi **pgAdmin** (interface graphique incluse)

3. **Créer la base de données**
   - Ouvre **pgAdmin** ou **psql** (SQL Shell)
   - Connecte-toi avec le user `postgres`
   - Exécute :
     ```sql
     CREATE DATABASE midimealy;
     ```

4. **Vérifier la connexion**
   ```bash
   psql -U postgres -d midimealy
   ```

---

### Option 3 : Hébergement Cloud (pour prod/test)

#### **Neon.tech** (Gratuit, serverless)
1. Va sur [https://neon.tech](https://neon.tech)
2. Créer un compte (gratuit)
3. Créer un nouveau projet `midimealy`
4. Copie la `DATABASE_URL` fournie

#### **Supabase** (Gratuit, avec UI)
1. Va sur [https://supabase.com](https://supabase.com)
2. Créer un projet
3. Dans Settings > Database, copie la `Connection String` (mode `connection pooling`)

---

## 🛠️ Configuration du projet

### 1. Cloner et installer les dépendances

```bash
cd Midi-Mealy
npm install
```

### 2. Configurer les variables d'environnement

Créer un fichier `.env` à la racine :

```env
# PostgreSQL local (Docker)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/midimealy

# Ou PostgreSQL natif Windows
# DATABASE_URL=postgres://postgres:TON_MOT_DE_PASSE@localhost:5432/midimealy

# Ou Neon/Supabase
# DATABASE_URL=postgres://user:pass@ep-xxx.region.neon.tech/midimealy

# Config serveur
PORT=3000
NODE_ENV=development

# Coordonnées par défaut (Paris La Défense)
DEFAULT_LAT=48.8922
DEFAULT_LNG=2.2389
```

### 3. Initialiser la base de données

Une fois PostgreSQL lancé et la `DATABASE_URL` configurée :

```bash
# Générer les migrations Drizzle
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Optionnel : Ouvrir Drizzle Studio (UI pour voir la BDD)
npm run db:studio
```

---

## 🚀 Lancer l'application

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur : **http://localhost:3000**

### Build de production

```bash
npm run build
npm start
```

---

## 🧪 Tester la connexion PostgreSQL

### Avec psql (CLI)

```bash
# Se connecter
psql -U postgres -d midimealy

# Lister les tables
\dt

# Voir le schéma d'une table
\d restaurants

# Quitter
\q
```

### Avec pgAdmin (GUI)

1. Ouvre **pgAdmin**
2. Ajoute un serveur :
   - Host: `localhost`
   - Port: `5432`
   - User: `postgres`
   - Password: ton mot de passe
3. Navigue dans `Databases > midimealy > Schemas > Tables`

### Avec Drizzle Studio

```bash
npm run db:studio
```

Interface web sur `https://local.drizzle.studio`

---

## 📦 Structure de la base de données

Le schéma sera généré automatiquement avec Drizzle, incluant :

- **restaurants** : nom, adresse, latitude, longitude, tags
- **reviews** : note (1-5), commentaire, user, restaurant
- **users** : nom, email (préparation pour auth future)

---

## 🐛 Troubleshooting

### Erreur "could not connect to server"

1. Vérifie que PostgreSQL tourne :
   ```bash
   # Docker
   docker ps
   
   # Windows natif
   services.msc → PostgreSQL doit être "Running"
   ```

2. Vérifie le port 5432 :
   ```bash
   netstat -an | findstr 5432
   ```

3. Vérifie la `DATABASE_URL` dans `.env`

### Erreur "database does not exist"

```bash
# Via psql
psql -U postgres
CREATE DATABASE midimealy;
\q
```

### Port 3000 déjà utilisé

Modifie dans `package.json` :
```json
"dev": "vite dev --port 3001"
```

---

## 📚 Prochaines étapes

1. ✅ PostgreSQL installé et lancé
2. ✅ Page d'accueil fonctionnelle
3. 🔄 Créer le schéma de base de données
4. 🔄 Implémenter la carte Leaflet
5. 🔄 API pour restaurants et reviews
6. 🔄 Système de notation

---

## 💡 Commandes utiles

```bash
# Développement
npm run dev              # Lance le serveur dev
npm run db:studio        # Interface BDD

# Base de données
npm run db:generate      # Génère migrations depuis schema
npm run db:migrate       # Applique migrations
npm run db:push          # Push direct (sans migration)

# Production
npm run build           # Build l'app
npm start               # Lance en prod

# Code quality
npm run check           # Vérifie le code (Biome)
npm run format          # Formate le code
npm run lint            # Lint le code
```

---

**Besoin d'aide ?** Vérifie que :
- ✅ PostgreSQL tourne (Docker ou service Windows)
- ✅ `.env` est bien configuré avec la bonne `DATABASE_URL`
- ✅ Les dépendances sont installées (`npm install`)

