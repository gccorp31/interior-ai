-- Script SQL pour migrer vers le modèle SaaS complet
-- Ce script prépare la base de données pour supporter les abonnements et la monétisation

-- 1. S'assurer que la table user_profiles a toutes les colonnes nécessaires
-- (voir migrate-user-profiles-subscriptions.sql pour les colonnes Stripe)

-- 2. Créer une fonction pour incrémenter les crédits (utilisée par les webhooks Stripe)
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
  SET credit_balance = COALESCE(credit_balance, 0) + p_amount
  WHERE id = p_user_id
  RETURNING credit_balance INTO v_new_balance;

  -- Si le profil n'existe pas, le créer
  IF v_new_balance IS NULL THEN
    INSERT INTO user_profiles (id, credit_balance, plan)
    VALUES (p_user_id, p_amount, 'Découverte')
    ON CONFLICT (id) DO UPDATE
    SET credit_balance = COALESCE(user_profiles.credit_balance, 0) + p_amount
    RETURNING credit_balance INTO v_new_balance;
  END IF;

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

-- 3. Créer une fonction pour décrémenter les crédits
CREATE OR REPLACE FUNCTION decrement_user_credits(
  p_user_id UUID,
  p_amount INTEGER DEFAULT 1
)
RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
  v_current_balance INTEGER;
BEGIN
  -- Récupérer le solde actuel
  SELECT COALESCE(credit_balance, 0) INTO v_current_balance
  FROM user_profiles
  WHERE id = p_user_id;

  -- Vérifier que l'utilisateur a suffisamment de crédits
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Crédits insuffisants. Solde actuel: %, Crédits requis: %', v_current_balance, p_amount;
  END IF;

  -- Décrémenter les crédits
  UPDATE user_profiles
  SET credit_balance = credit_balance - p_amount
  WHERE id = p_user_id
  RETURNING credit_balance INTO v_new_balance;

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer une table pour suivre les transactions de crédits (optionnel, pour l'audit)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Créer un index sur user_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);

-- 5. Créer une vue pour les statistiques des utilisateurs (optionnel)
CREATE OR REPLACE VIEW user_stats AS
SELECT
  up.id,
  up.credit_balance,
  up.plan,
  up.subscription_status,
  COUNT(g.id) as total_generations,
  COUNT(CASE WHEN g.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as generations_last_30_days,
  SUM(CASE WHEN ct.type = 'purchase' THEN ct.amount ELSE 0 END) as total_credits_purchased,
  SUM(CASE WHEN ct.type = 'usage' THEN ABS(ct.amount) ELSE 0 END) as total_credits_used
FROM user_profiles up
LEFT JOIN generations g ON g.user_id = up.id
LEFT JOIN credit_transactions ct ON ct.user_id = up.id
GROUP BY up.id, up.credit_balance, up.plan, up.subscription_status;

-- Commentaires
COMMENT ON FUNCTION increment_user_credits IS 'Incrémente les crédits d''un utilisateur (utilisé par les webhooks Stripe)';
COMMENT ON FUNCTION decrement_user_credits IS 'Décrémente les crédits d''un utilisateur (utilisé lors de la génération d''images)';
COMMENT ON TABLE credit_transactions IS 'Table pour suivre toutes les transactions de crédits (achats, utilisations, remboursements)';
COMMENT ON VIEW user_stats IS 'Vue agrégée des statistiques des utilisateurs (générations, crédits, etc.)';


