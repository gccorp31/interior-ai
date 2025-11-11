-- Script SQL pour ajouter les politiques RLS sur user_profiles
-- Ces politiques permettent à un utilisateur authentifié de :
-- 1. Lire (SELECT) son propre profil
-- 2. Créer (INSERT) son propre profil
-- 3. Mettre à jour (UPDATE) son propre profil

-- ========== POLITIQUE SELECT ==========
-- Permettre aux utilisateurs authentifiés de lire uniquement leur propre profil
DROP POLICY IF EXISTS "user_profiles_select_own" ON "user_profiles";

CREATE POLICY "user_profiles_select_own"
ON "user_profiles"
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ========== POLITIQUE INSERT ==========
-- Permettre aux utilisateurs authentifiés de créer uniquement leur propre profil
DROP POLICY IF EXISTS "user_profiles_insert_own" ON "user_profiles";

CREATE POLICY "user_profiles_insert_own"
ON "user_profiles"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ========== POLITIQUE UPDATE ==========
-- Permettre aux utilisateurs authentifiés de mettre à jour uniquement leur propre profil
DROP POLICY IF EXISTS "user_profiles_update_own" ON "user_profiles";

CREATE POLICY "user_profiles_update_own"
ON "user_profiles"
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Note: 
-- - USING: condition pour vérifier que l'utilisateur peut voir/modifier la ligne
-- - WITH CHECK: condition pour vérifier que l'utilisateur peut insérer/modifier avec ces valeurs
-- Les deux conditions sont identiques (auth.uid() = id) pour s'assurer que l'utilisateur
-- ne peut modifier que son propre profil

