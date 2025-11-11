-- ============================================
-- Script SQL pour configurer Supabase en Production
-- ============================================
-- Ce script doit être exécuté dans le SQL Editor de Supabase
-- Il crée toutes les tables, colonnes, politiques RLS et fonctions nécessaires
-- ============================================

-- ============================================
-- 1. CRÉER LA TABLE user_profiles
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credit_balance INTEGER DEFAULT 5,
  plan TEXT DEFAULT 'Découverte',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter les colonnes si elles n'existent pas déjà
DO $$ 
BEGIN
  -- credit_balance
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'credit_balance'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN credit_balance INTEGER DEFAULT 5;
  END IF;
  
  -- plan
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'plan'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN plan TEXT DEFAULT 'Découverte';
  END IF;
  
  -- created_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- ============================================
-- 2. CRÉER LA TABLE generations
-- ============================================
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  generated_image_url TEXT,
  prompt TEXT,
  style_key TEXT,
  room_type_key TEXT,
  has_watermark BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  published_to_gallery BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter les colonnes si elles n'existent pas déjà
DO $$ 
BEGIN
  -- has_watermark
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'generations' AND column_name = 'has_watermark'
  ) THEN
    ALTER TABLE generations ADD COLUMN has_watermark BOOLEAN DEFAULT false;
  END IF;
  
  -- is_public
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'generations' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE generations ADD COLUMN is_public BOOLEAN DEFAULT false;
  END IF;
  
  -- published_to_gallery
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'generations' AND column_name = 'published_to_gallery'
  ) THEN
    ALTER TABLE generations ADD COLUMN published_to_gallery BOOLEAN DEFAULT false;
  END IF;
END $$;

-- ============================================
-- 3. ACTIVER RLS (Row Level Security)
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CRÉER LES POLITIQUES RLS POUR user_profiles
-- ============================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Politique SELECT : Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Politique INSERT : Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Politique UPDATE : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 5. CRÉER LES POLITIQUES RLS POUR generations
-- ============================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view their own generations" ON generations;
DROP POLICY IF EXISTS "Users can insert their own generations" ON generations;
DROP POLICY IF EXISTS "Users can update their own generations" ON generations;
DROP POLICY IF EXISTS "Public can view published generations" ON generations;

-- Politique SELECT : Les utilisateurs peuvent voir leurs propres générations
CREATE POLICY "Users can view their own generations"
  ON generations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique SELECT : Le public peut voir les générations publiées
CREATE POLICY "Public can view published generations"
  ON generations
  FOR SELECT
  USING (is_public = true AND published_to_gallery = true);

-- Politique INSERT : Les utilisateurs peuvent créer leurs propres générations
CREATE POLICY "Users can insert their own generations"
  ON generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique UPDATE : Les utilisateurs peuvent mettre à jour leurs propres générations
CREATE POLICY "Users can update their own generations"
  ON generations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. CRÉER LA FONCTION increment_user_credits
-- ============================================
CREATE OR REPLACE FUNCTION increment_user_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Mettre à jour le solde de crédits
  UPDATE user_profiles
  SET credit_balance = COALESCE(credit_balance, 0) + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credit_balance INTO v_new_balance;

  -- Si le profil n'existe pas, le créer
  IF v_new_balance IS NULL THEN
    INSERT INTO user_profiles (id, credit_balance, plan)
    VALUES (p_user_id, p_amount, 'Découverte')
    ON CONFLICT (id) DO UPDATE
    SET credit_balance = COALESCE(user_profiles.credit_balance, 0) + p_amount,
        updated_at = NOW()
    RETURNING credit_balance INTO v_new_balance;
  END IF;

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. CRÉER UN TRIGGER POUR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

-- Créer le trigger
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. VÉRIFICATION FINALE
-- ============================================
-- Afficher un message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Configuration de la base de données terminée avec succès!';
  RAISE NOTICE '✅ Tables créées: user_profiles, generations';
  RAISE NOTICE '✅ RLS activé et politiques créées';
  RAISE NOTICE '✅ Fonction increment_user_credits créée';
  RAISE NOTICE '✅ Trigger updated_at créé';
END $$;




