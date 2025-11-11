-- Script SQL pour migrer les profils utilisateur vers le modèle d'abonnement
-- Ce script ajoute les colonnes nécessaires pour gérer les abonnements Stripe

-- Ajouter la colonne stripe_customer_id si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN stripe_customer_id TEXT;
    END IF;
END $$;

-- Ajouter la colonne stripe_subscription_id si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'stripe_subscription_id'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN stripe_subscription_id TEXT;
    END IF;
END $$;

-- Ajouter la colonne subscription_status si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'subscription_status'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN subscription_status TEXT DEFAULT 'discovery';
    END IF;
END $$;

-- Ajouter la colonne subscription_ends_at si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'subscription_ends_at'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN subscription_ends_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_subscription_id ON user_profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON user_profiles(subscription_status);

-- Mettre à jour les profils existants avec le statut "discovery" par défaut
UPDATE user_profiles 
SET subscription_status = 'discovery' 
WHERE subscription_status IS NULL;

-- Commentaires sur les colonnes
COMMENT ON COLUMN user_profiles.stripe_customer_id IS 'ID du customer Stripe associé à l''utilisateur';
COMMENT ON COLUMN user_profiles.stripe_subscription_id IS 'ID de l''abonnement Stripe actif';
COMMENT ON COLUMN user_profiles.subscription_status IS 'Statut de l''abonnement: discovery, essential, pro';
COMMENT ON COLUMN user_profiles.subscription_ends_at IS 'Date de fin de l''abonnement (pour les abonnements mensuels/annuels)';


