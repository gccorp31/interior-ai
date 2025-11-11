-- ============================================
-- Script SQL pour vérifier la configuration Supabase
-- ============================================
-- Exécutez ce script dans le SQL Editor de Supabase pour vérifier que tout est configuré correctement
-- ============================================

-- ============================================
-- 1. VÉRIFIER LES TABLES
-- ============================================

-- Vérifier que la table user_profiles existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles')
    THEN '✅ Table user_profiles existe'
    ELSE '❌ Table user_profiles manquante'
  END AS status_user_profiles;

-- Vérifier que la table generations existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'generations')
    THEN '✅ Table generations existe'
    ELSE '❌ Table generations manquante'
  END AS status_generations;

-- ============================================
-- 2. VÉRIFIER LES COLONNES DE user_profiles
-- ============================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name IN ('id', 'credit_balance', 'plan', 'created_at', 'updated_at')
    THEN '✅'
    ELSE '⚠️'
  END AS required
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- ============================================
-- 3. VÉRIFIER LES COLONNES DE generations
-- ============================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name IN ('id', 'user_id', 'original_image_url', 'generated_image_url', 'has_watermark', 'is_public', 'published_to_gallery')
    THEN '✅'
    ELSE '⚠️'
  END AS required
FROM information_schema.columns
WHERE table_name = 'generations'
ORDER BY ordinal_position;

-- ============================================
-- 4. VÉRIFIER RLS (Row Level Security)
-- ============================================

-- Vérifier que RLS est activé sur user_profiles
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS activé'
    ELSE '❌ RLS désactivé'
  END AS rls_status
FROM pg_tables
WHERE tablename = 'user_profiles';

-- Vérifier que RLS est activé sur generations
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS activé'
    ELSE '❌ RLS désactivé'
  END AS rls_status
FROM pg_tables
WHERE tablename = 'generations';

-- ============================================
-- 5. VÉRIFIER LES POLITIQUES RLS
-- ============================================

-- Politiques pour user_profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅'
    ELSE '❌'
  END AS policy_status
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Politiques pour generations
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅'
    ELSE '❌'
  END AS policy_status
FROM pg_policies
WHERE tablename = 'generations'
ORDER BY policyname;

-- ============================================
-- 6. VÉRIFIER LES FONCTIONS
-- ============================================

-- Vérifier que la fonction increment_user_credits existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'increment_user_credits'
    )
    THEN '✅ Fonction increment_user_credits existe'
    ELSE '❌ Fonction increment_user_credits manquante'
  END AS status_increment_function;

-- Vérifier que la fonction update_updated_at_column existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'update_updated_at_column'
    )
    THEN '✅ Fonction update_updated_at_column existe'
    ELSE '❌ Fonction update_updated_at_column manquante'
  END AS status_trigger_function;

-- ============================================
-- 7. VÉRIFIER LES TRIGGERS
-- ============================================

-- Vérifier que le trigger updated_at existe sur user_profiles
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  CASE 
    WHEN trigger_name IS NOT NULL THEN '✅'
    ELSE '❌'
  END AS trigger_status
FROM information_schema.triggers
WHERE event_object_table = 'user_profiles'
  AND trigger_name = 'update_user_profiles_updated_at';

-- ============================================
-- 8. RÉSUMÉ DE VÉRIFICATION
-- ============================================

SELECT 
  '📊 RÉSUMÉ DE LA CONFIGURATION' AS summary,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('user_profiles', 'generations')) AS tables_count,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('user_profiles', 'generations')) AS policies_count,
  (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('increment_user_credits', 'update_updated_at_column')) AS functions_count,
  (SELECT COUNT(*) FROM information_schema.triggers WHERE event_object_table = 'user_profiles') AS triggers_count;




