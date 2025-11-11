-- Script SQL pour vérifier et ajouter des crédits à un utilisateur
-- Usage: Exécuter ce script dans le SQL Editor de Supabase avec les paramètres appropriés

-- Fonction pour vérifier et ajouter des crédits
CREATE OR REPLACE FUNCTION check_and_add_credits(
  p_user_id UUID,
  p_credits_to_add INTEGER DEFAULT 5
)
RETURNS TABLE (
  user_id UUID,
  old_balance INTEGER,
  new_balance INTEGER,
  credits_added INTEGER
) AS $$
DECLARE
  v_old_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Récupérer le solde actuel
  SELECT COALESCE(credit_balance, 0) INTO v_old_balance
  FROM user_profiles
  WHERE id = p_user_id;

  -- Si le profil n'existe pas, le créer avec les crédits
  IF v_old_balance IS NULL THEN
    INSERT INTO user_profiles (id, credit_balance, plan)
    VALUES (p_user_id, p_credits_to_add, 'Découverte')
    ON CONFLICT (id) DO UPDATE
    SET credit_balance = COALESCE(user_profiles.credit_balance, 0) + p_credits_to_add;
    
    v_old_balance := 0;
    v_new_balance := p_credits_to_add;
  ELSE
    -- Mettre à jour le solde
    UPDATE user_profiles
    SET credit_balance = credit_balance + p_credits_to_add
    WHERE id = p_user_id;
    
    v_new_balance := v_old_balance + p_credits_to_add;
  END IF;

  -- Retourner les résultats
  RETURN QUERY SELECT
    p_user_id,
    v_old_balance,
    v_new_balance,
    p_credits_to_add;
END;
$$ LANGUAGE plpgsql;

-- Exemple d'utilisation:
-- SELECT * FROM check_and_add_credits('user-id-here', 10);


