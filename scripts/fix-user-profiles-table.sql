-- Script SQL pour corriger la structure de la table user_profiles
-- Ce script ajoute les colonnes manquantes si elles n'existent pas

-- ========== VÉRIFIER LA STRUCTURE ACTUELLE ==========
-- Exécutez cette requête pour voir la structure actuelle :
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'user_profiles'
-- ORDER BY ordinal_position;

-- ========== AJOUTER LA COLONNE credit_balance ==========
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'credit_balance'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN credit_balance INTEGER DEFAULT 5;
        RAISE NOTICE 'Colonne credit_balance ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne credit_balance existe déjà';
    END IF;
END $$;

-- ========== AJOUTER LA COLONNE plan ==========
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'plan'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN plan TEXT DEFAULT 'Découverte';
        RAISE NOTICE 'Colonne plan ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne plan existe déjà';
    END IF;
END $$;

-- ========== AJOUTER LA COLONNE created_at ==========
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Colonne created_at ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne created_at existe déjà';
    END IF;
END $$;

-- ========== AJOUTER LA COLONNE updated_at ==========
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Colonne updated_at ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne updated_at existe déjà';
    END IF;
END $$;

-- ========== Mettre à jour les valeurs par défaut pour les lignes existantes ==========
-- Si des profils existent déjà sans credit_balance, leur donner 5 crédits par défaut
UPDATE user_profiles 
SET credit_balance = 5 
WHERE credit_balance IS NULL;

UPDATE user_profiles 
SET plan = 'Découverte' 
WHERE plan IS NULL;

-- ========== VÉRIFIER LA STRUCTURE FINALE ==========
-- Exécutez cette requête pour vérifier que toutes les colonnes existent :
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

