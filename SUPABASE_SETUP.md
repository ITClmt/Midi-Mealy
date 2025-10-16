# Configuration Supabase pour Midi-Mealy

## Étapes de configuration

### 1. Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez les informations suivantes dans les paramètres du projet :
   - **Project URL** : Votre URL Supabase
   - **API Key (anon/public)** : Votre clé publique
   - **Database URL** : Dans Settings > Database > Connection String (URI)

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
# Supabase Configuration (VITE_ prefix pour exposition client-side)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application settings
NODE_ENV=development
PORT=3000
```

> **Note** : Le préfixe `VITE_` est nécessaire pour que Vite expose ces variables côté client.

### 3. Créer le schéma de base de données

Vous pouvez créer vos tables directement dans Supabase de deux façons :

#### Option A : Via l'interface Supabase (SQL Editor)

Allez dans **SQL Editor** dans votre projet Supabase et exécutez vos requêtes SQL.

#### Option B : Via Drizzle ORM (recommandé)

Si vous souhaitez utiliser Drizzle avec Supabase :

1. Installez les dépendances :
```bash
npm install drizzle-orm @supabase/supabase-js
npm install -D drizzle-kit
```

2. Créez un fichier `drizzle.config.ts` :
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

3. Générez et poussez vos migrations :
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

### 4. Utiliser Supabase dans votre application

```typescript
import { supabase } from './lib/db/supabase';

// Exemple de requête
const { data, error } = await supabase
  .from('your_table')
  .select('*');
```

### 5. Row Level Security (RLS)

N'oubliez pas de configurer les politiques RLS dans Supabase pour sécuriser vos données :

1. Allez dans **Authentication** > **Policies**
2. Créez des politiques pour chaque table
3. Exemple de politique :
```sql
-- Permettre la lecture publique
CREATE POLICY "Enable read access for all users" 
ON your_table FOR SELECT 
USING (true);

-- Permettre l'écriture uniquement aux utilisateurs authentifiés
CREATE POLICY "Enable insert for authenticated users only" 
ON your_table FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');
```

## Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Supabase + React](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)

