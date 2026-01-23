-- Schéma pour Midi-Mealy sur Supabase
-- Exécutez ce script dans le SQL Editor de Supabase


-- Table des avis/reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  restaurant_id text not null, -- OSM ID is string (e.g., "osm_123")
  restaurant_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text null,
  user_id uuid default auth.uid(), -- Links to the authenticated user
  username text null, -- Username of the reviewer
  constraint reviews_pkey primary key (id)
);

-- Table des bureaux/offices
CREATE TABLE IF NOT EXISTS offices (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  street TEXT,
  city TEXT,
  zip_code TEXT,
  country TEXT,
  logo_url TEXT DEFAULT 'https://cdn-icons-png.freepik.com/512/18214/18214645.png?ga=GA1.1.347094884.1761166313',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  manager_id UUID REFERENCES auth.users(id),
  join_policy TEXT NOT NULL DEFAULT 'open' CHECK (join_policy IN ('open', 'code_required')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des membres d'un office
CREATE TABLE IF NOT EXISTS office_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id BIGINT NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('manager', 'moderator', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(office_id, user_id)
);

-- Table des codes d'invitation
CREATE TABLE IF NOT EXISTS office_invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id BIGINT NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INTEGER DEFAULT NULL, -- NULL = utilisations illimitées
  uses_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table de cache pour les restaurants OSM
CREATE TABLE IF NOT EXISTS osm_restaurants_cache (
  id TEXT PRIMARY KEY, -- osm_id unique
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  cuisine TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  opening_hours TEXT,
  source TEXT DEFAULT 'osm',
  cache_key TEXT NOT NULL, -- clé de cache basée sur lat/lng/radius
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO offices (name, street, city, zip_code, country, logo_url, lat, lng)
VALUES (
  'Bankin’',
  '4 rue de la Pierre Levée',
  'Paris',
  '75011',
  'France',
  'https://play-lh.googleusercontent.com/B_bpPY8U0SBO5RZ6urI-0dT7qiRl8G5t5wrH6btWxR8KDA_v8ONZyKx7uQiCKe8_qAE=w240-h480-rw',
  48.864230,
  2.370750
);


-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_osm_cache_key ON osm_restaurants_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_osm_cache_expires ON osm_restaurants_cache(expires_at);

-- Activer Row Level Security (RLS)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE osm_restaurants_cache ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour reviews
CREATE POLICY "reviews_select_policy"
ON reviews FOR SELECT
USING (true);

CREATE POLICY "reviews_insert_policy"
ON reviews FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "reviews_update_policy"
ON reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "reviews_delete_policy"
ON reviews FOR DELETE
USING (auth.uid() = user_id);

-- Politiques RLS pour offices (lecture publique)
CREATE POLICY "Enable read access for all users"
ON offices FOR SELECT
USING (true);

-- Politiques RLS pour offices (création pour utilisateurs authentifiés)
CREATE POLICY "Enable insert for authenticated users only"
ON offices FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Politiques RLS pour offices (modification par le manager uniquement)
CREATE POLICY "Enable update for office manager only"
ON offices FOR UPDATE
USING (auth.uid() = manager_id);

-- Politiques RLS pour offices (suppression par le manager uniquement)
CREATE POLICY "Enable delete for office manager only"
ON offices FOR DELETE
USING (auth.uid() = manager_id);

-- Politiques RLS pour osm_restaurants_cache (accès public pour cache)
-- Permet les opérations serveur sans authentification
CREATE POLICY "Enable read access for all users"
ON osm_restaurants_cache FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON osm_restaurants_cache FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON osm_restaurants_cache FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for all users"
ON osm_restaurants_cache FOR DELETE
USING (true);



-- Politiques RLS pour office_members
ALTER TABLE office_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON office_members FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON office_members FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for managers and moderators"
ON office_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM office_members om 
    WHERE om.office_id = office_members.office_id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('manager', 'moderator')
  )
);

CREATE POLICY "Enable delete for managers and self"
ON office_members FOR DELETE
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM office_members om 
    WHERE om.office_id = office_members.office_id 
    AND om.user_id = auth.uid() 
    AND om.role = 'manager'
  )
);

-- Politiques RLS pour office_invite_codes
ALTER TABLE office_invite_codes ENABLE ROW LEVEL SECURITY;

-- Lecture : tout le monde peut lire (pour valider un code)
CREATE POLICY "Enable read access for all users"
ON office_invite_codes FOR SELECT
USING (true);

-- Création : managers et modérateurs uniquement
CREATE POLICY "Enable insert for managers and moderators"
ON office_invite_codes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM office_members om 
    WHERE om.office_id = office_invite_codes.office_id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('manager', 'moderator')
  )
  OR
  EXISTS (
    SELECT 1 FROM offices o
    WHERE o.id = office_invite_codes.office_id
    AND o.manager_id = auth.uid()
  )
);

-- Mise à jour : managers, modérateurs, et mise à jour du uses_count par tout le monde
CREATE POLICY "Enable update for managers and code usage"
ON office_invite_codes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM office_members om 
    WHERE om.office_id = office_invite_codes.office_id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('manager', 'moderator')
  )
  OR
  EXISTS (
    SELECT 1 FROM offices o
    WHERE o.id = office_invite_codes.office_id
    AND o.manager_id = auth.uid()
  )
  OR auth.role() = 'authenticated' -- Pour incrémenter uses_count
);

-- Suppression : managers uniquement
CREATE POLICY "Enable delete for managers"
ON office_invite_codes FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM office_members om 
    WHERE om.office_id = office_invite_codes.office_id 
    AND om.user_id = auth.uid() 
    AND om.role = 'manager'
  )
  OR
  EXISTS (
    SELECT 1 FROM offices o
    WHERE o.id = office_invite_codes.office_id
    AND o.manager_id = auth.uid()
  )
);

-- Index pour optimiser les recherches de codes
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON office_invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_office ON office_invite_codes(office_id);
