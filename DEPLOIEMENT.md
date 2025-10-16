# 🚀 Guide de déploiement Dokploy

Ce guide explique comment déployer Midi-Mealy sur **Dokploy** en quelques étapes.

---

## 📋 Prérequis

- ✅ Un serveur avec **Dokploy** installé
- ✅ Un compte GitHub/GitLab (ou accès Git)
- ✅ Accès SSH au serveur (optionnel)

---

## 🗄️ Étape 1 : Créer la base de données Supabase

### **Configuration Supabase (recommandé)**

1. Va sur [supabase.com](https://supabase.com)
2. Crée un nouveau projet :
   - **Name** : `Midi-Mealy`
   - **Database Password** : (génère un mot de passe sécurisé)
   - **Region** : Choisis la plus proche de toi
3. Une fois le projet créé, va dans **SQL Editor**
4. Exécute le script `supabase-schema.sql` du repo
5. Note ces informations (dans **Settings** > **API**) :
   - **Project URL** : `https://your-project-id.supabase.co`
   - **Anon/Public Key** : Ta clé publique

### **Pourquoi Supabase ?**

✅ **Gratuit** jusqu'à 500 MB de base de données  
✅ **UI intuitive** pour gérer les données  
✅ **Row Level Security** déjà configuré  
✅ **API auto-générée** pour tous les CRUD  
✅ **Backups automatiques** et monitoring inclus

---

## 🐳 Étape 2 : Déployer l'application

### **Via Dokploy UI**

#### 1️⃣ **Créer un nouveau projet**

1. Dans Dokploy, va dans **Applications**
2. Clique sur **Create Application**
3. Sélectionne **Docker**

#### 2️⃣ **Configuration Git**

- **Repository URL** : `https://github.com/TON_USERNAME/Midi-Mealy`
- **Branch** : `main`
- **Build Path** : `/`
- **Dockerfile Path** : `Dockerfile`

#### 3️⃣ **Variables d'environnement**

Ajoute ces variables :

```env
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Node
NODE_ENV=production
PORT=3000

# App (optionnel)
APP_URL=https://ton-domaine.com
```

> **Important** : Remplace les valeurs Supabase par celles de ton projet (Settings > API dans Supabase).

#### 4️⃣ **Configuration réseau**

- **Port interne** : `3000`
- **Domaine** : Configure ton sous-domaine (ex: `midimealy.ton-serveur.com`)
- **SSL/HTTPS** : Active automatiquement avec Let's Encrypt

#### 5️⃣ **Lancer le build**

1. Clique sur **Deploy**
2. Dokploy va :
   - Cloner le repo
   - Builder l'image Docker
   - Lancer le container
   - Configurer le reverse proxy avec SSL

#### 6️⃣ **Initialiser la base de données**

Une fois déployé, accède au terminal du container :

```bash
# Via Dokploy UI : Applications > Ton App > Terminal
# Ou via SSH sur le serveur

# Se connecter au container
docker exec -it <container-name> sh

# Générer et appliquer les migrations Drizzle
npm run db:generate
npm run db:migrate
```

---

## 🔄 Étape 3 : Migrations automatiques (optionnel)

Pour appliquer les migrations automatiquement au déploiement, crée un script de démarrage :

### Créer `start.sh`

```bash
#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npm run db:migrate

echo "🚀 Starting application..."
node .output/server/index.mjs
```

### Modifier le `Dockerfile`

Remplace la dernière ligne :

```dockerfile
# Au lieu de
CMD ["node", ".output/server/index.mjs"]

# Utilise
COPY --from=builder --chown=tanstack:nodejs /app/start.sh ./start.sh
RUN chmod +x ./start.sh
CMD ["./start.sh"]
```

---

## 🔧 Configuration avancée

### **1. Volumes persistants**

Si tu veux persister des données locales :

```yaml
# Dans Dokploy, section Volumes
/app/data:/data
```

### **2. Variables d'environnement supplémentaires**

```env
# Rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100

# Sentry (monitoring erreurs)
SENTRY_DSN=https://...

# Redis (cache - optionnel)
REDIS_URL=redis://localhost:6379
```

### **3. Scaling**

Dans Dokploy, tu peux scaler horizontalement :
- **Replicas** : 2-3 instances
- **Load Balancing** : automatique

---

## 📊 Monitoring et logs

### **Voir les logs en temps réel**

Via Dokploy UI :
1. Applications > Ton App > **Logs**
2. Ou via SSH :

```bash
docker logs -f <container-name>
```

### **Healthcheck**

L'application expose un healthcheck automatique :
- URL : `http://localhost:3000/` (vérifie que le serveur répond)
- Interval : 30s
- Timeout : 10s

Dokploy redémarre automatiquement le container si le healthcheck échoue.

---

## 🐛 Troubleshooting

### ❌ **Erreur : "Could not connect to database"**

1. Vérifie que `DATABASE_URL` est correcte
2. Teste la connexion depuis le container :

```bash
docker exec -it <container> sh
apk add postgresql-client
psql $DATABASE_URL
```

### ❌ **Erreur : "Port already in use"**

Change le port dans les variables d'environnement :
```env
PORT=3001
```

### ❌ **Erreur : "Build failed"**

Vérifie les logs de build dans Dokploy. Souvent :
- Dépendances manquantes → Utilise `--legacy-peer-deps`
- Mémoire insuffisante → Augmente la RAM allouée

### ❌ **L'app crash au démarrage**

1. Vérifie les logs :
   ```bash
   docker logs <container-name>
   ```

2. Vérifie que toutes les variables d'env sont définies
3. Teste en local avec Docker :
   ```bash
   docker build -t midimealy .
   docker run -p 3000:3000 -e DATABASE_URL="..." midimealy
   ```

---

## 🔄 Mises à jour

### **Déploiement continu (CD)**

**Option 1 : Webhook GitHub**

1. Dans Dokploy : Applications > Ton App > **Webhooks**
2. Copie l'URL du webhook
3. Dans GitHub : Settings > Webhooks > Add webhook
4. Colle l'URL, sélectionne "Push events"

Maintenant, chaque `git push` déclenchera un redéploiement automatique !

**Option 2 : Manuel**

Via Dokploy UI :
1. Applications > Ton App
2. Clique sur **Redeploy**

---

## 📝 Checklist de déploiement

Avant de déployer en production :

- [ ] PostgreSQL créé et accessible
- [ ] `DATABASE_URL` configurée
- [ ] Variables d'environnement définies
- [ ] Domaine configuré avec SSL
- [ ] Migrations appliquées
- [ ] Healthcheck fonctionne
- [ ] Logs accessibles
- [ ] Backup automatique de la BDD configuré

---

## 🎯 Déploiement rapide (résumé)

```bash
# 1. Push ton code sur GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Dans Dokploy :
# - Créer BDD PostgreSQL
# - Créer App Docker depuis GitHub
# - Ajouter DATABASE_URL
# - Deploy

# 3. Initialiser la BDD
docker exec -it <container> sh
npm run db:migrate

# 4. C'est prêt ! 🎉
```

---

## 🔐 Sécurité

### **Best practices**

- ✅ Utilise des mots de passe forts pour PostgreSQL
- ✅ Active SSL/HTTPS (automatique avec Dokploy)
- ✅ Ne commit JAMAIS de `.env` dans Git
- ✅ Limite l'accès à la BDD (firewall, IP whitelist)
- ✅ Configure un backup automatique de PostgreSQL
- ✅ Utilise des secrets Dokploy pour les variables sensibles

---

## 📚 Ressources

- [Documentation Dokploy](https://docs.dokploy.com)
- [TanStack Start Deployment](https://tanstack.com/start/latest/docs/deployment)
- [PostgreSQL on Docker](https://hub.docker.com/_/postgres)

---

## 💡 Astuces

### **Performance**

- Active le cache HTTP (reverse proxy Dokploy)
- Utilise un CDN pour les assets statiques
- Configure PostgreSQL connection pooling (pgbouncer)

### **Monitoring**

Intègre des outils :
- **Sentry** pour les erreurs
- **Uptime Kuma** pour monitoring
- **Grafana + Prometheus** pour métriques

---

🎉 **Félicitations ! Ton application est en production !**

Pour toute question, vérifie les logs ou contacte le support Dokploy.

