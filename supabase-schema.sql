-- Schéma initial pour Midi-Mealy sur Supabase
-- Exécutez ce script dans le SQL Editor de Supabase

-- Table des restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  logo_url TEXT DEFAULT 'https://www.pngall.com/wp-content/uploads/8/Restaurant-PNG-HD-Image.png',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  avg_rating DOUBLE PRECISION DEFAULT 0,
  ratings_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des avis/reviews
CREATE TABLE IF NOT EXISTS reviews (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(lat, lng);
CREATE INDEX IF NOT EXISTS idx_osm_cache_key ON osm_restaurants_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_osm_cache_expires ON osm_restaurants_cache(expires_at);

-- Activer Row Level Security (RLS)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE osm_restaurants_cache ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour restaurants (lecture publique)
CREATE POLICY "Enable read access for all users"
ON restaurants FOR SELECT
USING (true);

-- Politiques RLS pour restaurants (écriture pour utilisateurs authentifiés)
CREATE POLICY "Enable insert for authenticated users only"
ON restaurants FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only"
ON restaurants FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only"
ON restaurants FOR DELETE
USING (auth.role() = 'authenticated');

-- Politiques RLS pour reviews (lecture publique)
CREATE POLICY "Enable read access for all users"
ON reviews FOR SELECT
USING (true);

-- Politiques RLS pour reviews (écriture pour utilisateurs authentifiés)
CREATE POLICY "Enable insert for authenticated users only"
ON reviews FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only"
ON reviews FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only"
ON reviews FOR DELETE
USING (auth.role() = 'authenticated');

-- Politiques RLS pour offices (lecture publique)
CREATE POLICY "Enable read access for all users"
ON offices FOR SELECT
USING (true);

-- Politiques RLS pour offices (écriture pour utilisateurs authentifiés)
CREATE POLICY "Enable insert for authenticated users only"
ON offices FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only"
ON offices FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only"
ON offices FOR DELETE
USING (auth.role() = 'authenticated');

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
