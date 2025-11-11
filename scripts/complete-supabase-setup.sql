-- ============================================
-- Script SQL COMPLET pour configurer Supabase en Production
-- ============================================
-- Ce script combine tous les scripts nécessaires pour configurer Supabase
-- Exécutez ce script dans le SQL Editor de Supabase
-- ============================================

-- ============================================
-- ÉTAPE 1 : CRÉER LES TABLES ET COLONNES
-- ============================================
-- (Contenu de setup-production-database.sql)
-- ============================================

-- Créer la table user_profiles
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
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'credit_balance'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN credit_balance INTEGER DEFAULT 5;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'plan'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN plan TEXT DEFAULT 'Découverte';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Créer la table generations
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
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'generations' AND column_name = 'has_watermark'
  ) THEN
    ALTER TABLE generations ADD COLUMN has_watermark BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'generations' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE generations ADD COLUMN is_public BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'generations' AND column_name = 'published_to_gallery'
  ) THEN
    ALTER TABLE generations ADD COLUMN published_to_gallery BOOLEAN DEFAULT false;
  END IF;
END $$;

-- ============================================
-- ÉTAPE 2 : ACTIVER RLS
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 3 : CRÉER LES POLITIQUES RLS
-- ============================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own generations" ON generations;
DROP POLICY IF EXISTS "Public can view published generations" ON generations;
DROP POLICY IF EXISTS "Users can insert their own generations" ON generations;
DROP POLICY IF EXISTS "Users can update their own generations" ON generations;

-- Politiques pour user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Politiques pour generations
CREATE POLICY "Users can view their own generations"
  ON generations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view published generations"
  ON generations
  FOR SELECT
  USING (is_public = true AND published_to_gallery = true);

CREATE POLICY "Users can insert their own generations"
  ON generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations"
  ON generations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ÉTAPE 4 : CRÉER LES FONCTIONS
-- ============================================

-- Fonction increment_user_credits
CREATE OR REPLACE FUNCTION increment_user_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE user_profiles
  SET credit_balance = COALESCE(credit_balance, 0) + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credit_balance INTO v_new_balance;

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

-- Fonction update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ÉTAPE 5 : CRÉER LES TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ÉTAPE 6 : CONFIGURER LE STORAGE
-- ============================================
-- Note: Le bucket "uploads" doit être créé manuellement dans l'interface Supabase
-- Ce script configure uniquement les politiques de stockage

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "storage_insert_uploads_public" ON storage.objects;
DROP POLICY IF EXISTS "storage_select_uploads_public" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_uploads_public" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_uploads_public" ON storage.objects;

-- Créer les politiques de stockage
CREATE POLICY "storage_insert_uploads_public"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "storage_select_uploads_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'uploads');

CREATE POLICY "storage_update_uploads_public"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "storage_delete_uploads_public"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');

-- ============================================
-- ÉTAPE 7 : VÉRIFICATION FINALE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Configuration Supabase terminée avec succès!';
  RAISE NOTICE '✅ Tables créées: user_profiles, generations';
  RAISE NOTICE '✅ RLS activé et politiques créées';
  RAISE NOTICE '✅ Fonction increment_user_credits créée';
  RAISE NOTICE '✅ Trigger updated_at créé';
  RAISE NOTICE '✅ Politiques de stockage créées';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: Créez le bucket "uploads" manuellement dans Storage > Buckets';
  RAISE NOTICE '   - Nom: uploads';
  RAISE NOTICE '   - Public: Activé';
  RAISE NOTICE '   - File size limit: 10 MB';
  RAISE NOTICE '   - Allowed MIME types: image/*';
END $$;




