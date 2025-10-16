-- Schéma initial pour Midi-Mealy sur Supabase
-- Exécutez ce script dans le SQL Editor de Supabase

-- Table des restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  avg_rating DOUBLE PRECISION DEFAULT 0,
  ratings_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des avis/reviews
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(lat, lng);

-- Activer Row Level Security (RLS)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

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

