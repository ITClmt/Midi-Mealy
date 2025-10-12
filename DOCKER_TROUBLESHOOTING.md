# 🐳 Docker Troubleshooting Guide

## ❌ Erreur : "authentification par mot de passe échouée"

### **Cause**
Le container Docker n'arrive pas à se connecter à PostgreSQL.

### **Solutions**

#### **Solution 1 : Utiliser docker-compose (recommandé)**

Au lieu de lancer les containers séparément, utilise docker-compose qui configure le réseau automatiquement :

```bash
# Arrêter les containers existants
docker-compose down

# Lancer l'application complète (BDD + App)
npm run docker:up

# Voir les logs
npm run docker:logs
```

#### **Solution 2 : Créer un réseau Docker manuel**

```bash
# Créer un réseau
docker network create midimealy-network

# Lancer PostgreSQL sur ce réseau
docker run -d \
  --name midimealy-postgres \
  --network midimealy-network \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=midimealy \
  -p 5432:5432 \
  postgres:16

# Lancer l'app sur le même réseau
docker run -d \
  --name midimealy-app \
  --network midimealy-network \
  -e DATABASE_URL="postgres://postgres:postgres@midimealy-postgres:5432/midimealy" \
  -e NODE_ENV=production \
  -p 3000:3000 \
  midimealy
```

#### **Solution 3 : Utiliser l'IP de l'hôte (Windows/Mac)**

**Windows** :
```bash
# Trouver l'IP de WSL2 ou utiliser host.docker.internal
docker run -p 3000:3000 \
  -e DATABASE_URL="postgres://postgres:postgres@host.docker.internal:5432/midimealy" \
  midimealy
```

**Mac** :
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgres://postgres:postgres@host.docker.internal:5432/midimealy" \
  midimealy
```

**Linux** :
```bash
# Utiliser l'IP de docker0
docker run -p 3000:3000 \
  -e DATABASE_URL="postgres://postgres:postgres@172.17.0.1:5432/midimealy" \
  midimealy
```

---

## 🔧 Vérifier la connexion PostgreSQL

### **Depuis l'hôte**

```bash
# Test avec psql
psql postgres://postgres:postgres@localhost:5432/midimealy -c "SELECT 1"

# Ou avec Docker
docker exec -it midimealy-postgres psql -U postgres -d midimealy
```

### **Depuis le container**

```bash
# Entrer dans le container
docker exec -it midimealy-app sh

# Installer psql (si besoin)
apk add postgresql-client

# Tester la connexion
psql $DATABASE_URL -c "SELECT 1"
```

---

## 📋 Commandes Docker utiles

### **Build & Run**

```bash
# Build l'image
npm run docker:build

# Lancer avec docker-compose
npm run docker:up

# Arrêter
npm run docker:down

# Voir les logs
npm run docker:logs
```

### **Inspection**

```bash
# Voir les containers en cours
docker ps

# Voir les logs d'un container
docker logs midimealy-app
docker logs midimealy-postgres

# Inspecter un container
docker inspect midimealy-app

# Voir les réseaux
docker network ls
```

### **Nettoyage**

```bash
# Arrêter et supprimer tout
docker-compose down -v

# Supprimer l'image
docker rmi midimealy

# Nettoyer tout
docker system prune -a
```

---

## 🧪 Tests locaux sans Docker

### **Option 1 : PostgreSQL local + dev**

```bash
# 1. Lancer PostgreSQL avec docker-compose (juste la BDD)
docker-compose up postgres -d

# 2. Créer .env
echo 'DATABASE_URL=postgres://postgres:postgres@localhost:5432/midimealy' > .env

# 3. Appliquer les migrations
npm run db:migrate

# 4. Lancer l'app en dev
npm run dev
```

### **Option 2 : Build local**

```bash
# 1. Build l'app
npm run build

# 2. Lancer en production locale
DATABASE_URL=postgres://postgres:postgres@localhost:5432/midimealy npm start
```

---

## 🚨 Erreurs courantes

### **❌ Port already in use**

```bash
# Trouver le process utilisant le port 3000
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000

# Tuer le process ou changer le port
docker run -p 3001:3000 ...
```

### **❌ Build failed: ENOENT**

```bash
# S'assurer que tous les fichiers sont présents
ls -la src/lib/db/

# Rebuilder sans cache
docker build --no-cache -t midimealy .
```

### **❌ Migration failed: relation does not exist**

```bash
# Supprimer et recréer la BDD
docker exec -it midimealy-postgres psql -U postgres -c "DROP DATABASE IF EXISTS midimealy"
docker exec -it midimealy-postgres psql -U postgres -c "CREATE DATABASE midimealy"

# Relancer les migrations
docker-compose restart app
```

### **❌ Cannot connect to Docker daemon**

```bash
# Windows: Vérifier que Docker Desktop est lancé
# Linux: Vérifier que Docker service tourne
sudo systemctl status docker

# Relancer Docker
sudo systemctl start docker
```

---

## ✅ Vérification complète

### **Checklist avant déploiement**

```bash
# 1. Build réussit
npm run docker:build
# ✓ Should complete without errors

# 2. Lancer avec docker-compose
npm run docker:up
# ✓ Both containers should start

# 3. Vérifier les logs
npm run docker:logs
# ✓ Should see: "🚀 Starting application..."
# ✓ Should see: "✅ Migrations completed successfully!"

# 4. Tester l'app
curl http://localhost:3000
# ✓ Should return HTML

# 5. Vérifier la BDD
docker exec -it midimealy-postgres psql -U postgres -d midimealy -c "\dt"
# ✓ Should list tables: users, restaurants, reviews
```

---

## 📖 Ressources

- [Docker Networking](https://docs.docker.com/network/)
- [Docker Compose](https://docs.docker.com/compose/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)
- [TanStack Start Deployment](https://tanstack.com/start/latest/docs/deployment)

---

## 💡 Tips

1. **Toujours utiliser docker-compose** pour le développement local
2. **Utiliser des noms de réseaux explicites** pour éviter les conflits
3. **Logger les variables d'env** au démarrage (sans les secrets)
4. **Tester le healthcheck** : `docker inspect midimealy-app | grep Health`
5. **Utiliser docker-compose.override.yml** pour les configs locales

---

🎉 **Besoin d'aide ?** Vérifie les logs avec `npm run docker:logs`

