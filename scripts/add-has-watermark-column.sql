-- Script SQL pour ajouter la colonne has_watermark à la table generations
-- Cette colonne indique si l'image générée a un watermark (pour les utilisateurs anonymes)

-- Ajouter la colonne has_watermark si elle n'existe pas déjà
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'generations' 
        AND column_name = 'has_watermark'
    ) THEN
        ALTER TABLE generations 
        ADD COLUMN has_watermark BOOLEAN DEFAULT false;
        
        -- Mettre à jour les générations existantes (par défaut, pas de watermark pour les utilisateurs authentifiés)
        UPDATE generations 
        SET has_watermark = false 
        WHERE has_watermark IS NULL;
    END IF;
END $$;

-- Ajouter un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_generations_has_watermark ON generations(has_watermark);

-- Commentaire sur la colonne
COMMENT ON COLUMN generations.has_watermark IS 'Indique si l''image générée a un watermark (true pour les utilisateurs anonymes, false pour les utilisateurs authentifiés)';


