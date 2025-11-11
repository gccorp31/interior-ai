-- Script SQL pour vérifier si un profil utilisateur existe dans la base de données
-- Remplacez 'USER_ID_HERE' par l'ID de l'utilisateur que vous voulez vérifier

-- Vérifier si le profil existe
SELECT 
    id,
    credit_balance,
    plan,
    created_at,
    updated_at
FROM user_profiles
WHERE id = 'USER_ID_HERE';

-- Si aucun résultat, le profil n'existe pas
-- Si un résultat est retourné, le profil existe avec les valeurs affichées

-- Pour voir tous les profils (pour debug)
-- SELECT id, credit_balance, plan, created_at FROM user_profiles ORDER BY created_at DESC LIMIT 10;




