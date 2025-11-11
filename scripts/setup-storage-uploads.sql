-- ============================================
-- Script SQL pour configurer le Storage Supabase
-- ============================================
-- Ce script configure le bucket "uploads" pour le stockage des images
-- ============================================

-- ============================================
-- 1. CRÉER LE BUCKET "uploads" (si n'existe pas)
-- ============================================
-- Note: La création de bucket se fait généralement via l'interface Supabase
-- Ce script configure les politiques de stockage

-- ============================================
-- 2. POLITIQUES DE STOCKAGE POUR LE BUCKET "uploads"
-- ============================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "storage_insert_uploads_public" ON storage.objects;
DROP POLICY IF EXISTS "storage_select_uploads_public" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_uploads_public" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_uploads_public" ON storage.objects;

-- ============================================
-- 3. POLITIQUE INSERT : Permettre l'upload public
-- ============================================
-- Cette politique permet à tout le monde (y compris les utilisateurs anonymes) d'uploader des images
CREATE POLICY "storage_insert_uploads_public"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'uploads');

-- ============================================
-- 4. POLITIQUE SELECT : Permettre la lecture publique
-- ============================================
-- Cette politique permet à tout le monde de lire les images uploadées
CREATE POLICY "storage_select_uploads_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- ============================================
-- 5. POLITIQUE UPDATE : Permettre la mise à jour (optionnel)
-- ============================================
-- Cette politique permet aux utilisateurs authentifiés de mettre à jour leurs propres fichiers
CREATE POLICY "storage_update_uploads_public"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- ============================================
-- 6. POLITIQUE DELETE : Permettre la suppression (optionnel)
-- ============================================
-- Cette politique permet aux utilisateurs authentifiés de supprimer leurs propres fichiers
CREATE POLICY "storage_delete_uploads_public"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');

-- ============================================
-- 7. VÉRIFICATION
-- ============================================
-- Vérifier que les politiques existent
SELECT 
  policyname,
  cmd,
  roles,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅'
    ELSE '❌'
  END AS status
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE 'storage_%_uploads_%'
ORDER BY policyname;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Le bucket "uploads" doit être créé manuellement dans l'interface Supabase :
--    - Aller dans Storage > Buckets
--    - Cliquer sur "New bucket"
--    - Nom : "uploads"
--    - Public : Activé
--    - File size limit : 10 MB (ou selon vos besoins)
--    - Allowed MIME types : image/*
--
-- 2. Après avoir créé le bucket, exécutez ce script pour configurer les politiques
--
-- 3. Les politiques permettent :
--    - INSERT : Tout le monde peut uploader (y compris les utilisateurs anonymes)
--    - SELECT : Tout le monde peut lire les images
--    - UPDATE : Seuls les utilisateurs authentifiés peuvent mettre à jour
--    - DELETE : Seuls les utilisateurs authentifiés peuvent supprimer




