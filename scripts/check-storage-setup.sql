-- ============================================
-- Script SQL pour vérifier la configuration du Storage
-- ============================================
-- Exécutez ce script dans le SQL Editor de Supabase pour vérifier que le Storage est configuré
-- ============================================

-- ============================================
-- 1. VÉRIFIER QUE LE BUCKET "uploads" EXISTE
-- ============================================
-- Note: Cette requête nécessite d'être exécutée avec les permissions appropriées
-- Si elle échoue, vérifiez manuellement dans l'interface Supabase > Storage > Buckets

SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  CASE 
    WHEN name = 'uploads' THEN '✅ Bucket uploads existe'
    ELSE '❌ Bucket uploads manquant'
  END AS status
FROM storage.buckets
WHERE name = 'uploads';

-- ============================================
-- 2. VÉRIFIER LES POLITIQUES DE STOCKAGE
-- ============================================

SELECT 
  policyname,
  cmd,
  roles,
  qual,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅'
    ELSE '❌'
  END AS status
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE 'storage_%_uploads_%'
ORDER BY policyname;

-- ============================================
-- 3. RÉSUMÉ
-- ============================================

SELECT 
  '📊 RÉSUMÉ DU STORAGE' AS summary,
  (SELECT COUNT(*) FROM storage.buckets WHERE name = 'uploads') AS bucket_exists,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE 'storage_%_uploads_%') AS policies_count;

-- ============================================
-- NOTES
-- ============================================
-- Si le bucket n'existe pas :
-- 1. Aller dans Supabase Dashboard > Storage > Buckets
-- 2. Cliquer sur "New bucket"
-- 3. Nom : "uploads"
-- 4. Public : Activé
-- 5. File size limit : 10 MB (ou selon vos besoins)
-- 6. Allowed MIME types : image/*
--
-- Si les politiques n'existent pas :
-- 1. Exécuter le script setup-storage-uploads.sql
-- 2. Vérifier que les politiques sont créées




