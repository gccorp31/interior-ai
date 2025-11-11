# Configuration Supabase

Ce document décrit comment configurer Supabase pour MonDécorateurIA.

## 1. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL du projet et la clé `service_role`

## 2. Configurer les variables d'environnement

Ajouter les variables suivantes dans `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

## 3. Créer les tables

### Table `user_profiles`

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credit_balance INTEGER DEFAULT 5,
  plan TEXT DEFAULT 'Découverte',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'discovery',
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table `generations`

```sql
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  generated_image_url TEXT,
  prompt TEXT,
  style_key TEXT,
  room_type_key TEXT,
  has_watermark BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  published_to_gallery BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. Configurer les politiques RLS (Row Level Security)

Exécuter le script SQL `scripts/add-user-profiles-update-policy.sql` dans le SQL Editor de Supabase.

## 5. Configurer le Storage

1. Créer un bucket `uploads` dans Storage
2. Configurer les politiques d'accès pour permettre l'upload public
3. Exécuter le script SQL `scripts/update-storage-uploads-policy.sql`

## 6. Migrations optionnelles

Pour activer les abonnements Stripe:
- Exécuter `scripts/migrate-user-profiles-subscriptions.sql`
- Exécuter `scripts/migrate-to-saas-model.sql`

Pour ajouter la colonne watermark:
- Exécuter `scripts/add-has-watermark-column.sql`

## 7. Vérification

Vérifier que:
- Les tables sont créées
- Les politiques RLS sont actives
- Le bucket Storage est configuré
- Les variables d'environnement sont correctes

## Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Setup](https://supabase.com/docs/guides/storage)


