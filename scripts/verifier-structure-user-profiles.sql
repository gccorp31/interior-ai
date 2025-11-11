-- Script SQL pour vérifier la structure de la table user_profiles
-- Exécutez ce script dans le SQL Editor de Supabase pour voir la structure actuelle

-- ========== VÉRIFIER LES COLONNES ==========
SELECT 
    column_name as "Nom de la colonne",
    data_type as "Type de données",
    is_nullable as "Peut être NULL",
    column_default as "Valeur par défaut"
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- ========== VÉRIFIER LES CONTRAINTES ==========
SELECT 
    constraint_name as "Nom de la contrainte",
    constraint_type as "Type"
FROM information_schema.table_constraints
WHERE table_name = 'user_profiles';

-- ========== VÉRIFIER LES INDEX ==========
SELECT 
    indexname as "Nom de l'index",
    indexdef as "Définition"
FROM pg_indexes
WHERE tablename = 'user_profiles';

-- ========== VÉRIFIER LES PROFILS EXISTANTS ==========
-- Cette requête ne fonctionnera que si les colonnes existent
-- Si elle échoue, exécutez d'abord fix-user-profiles-table.sql
SELECT 
    id,
    credit_balance,
    plan,
    created_at,
    updated_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 10;

