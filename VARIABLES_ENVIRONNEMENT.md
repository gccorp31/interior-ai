# 🔐 Variables d'Environnement - MonDécorateurIA

Ce document liste toutes les variables d'environnement nécessaires pour faire fonctionner l'application.

**⚠️ Important** : Créez un fichier `.env.local` à la racine du projet et ajoutez toutes ces variables avec vos valeurs réelles.

---

## 📋 Liste des Variables d'Environnement

### Supabase

```env
# URL de votre projet Supabase (trouvable dans Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co

# Clé anonyme Supabase (publique, peut être exposée côté client)
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_ici

# Clé service role Supabase (SECRÈTE, ne jamais exposer côté client)
# Trouvable dans Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

### Stripe

```env
# Clé secrète Stripe (trouvable dans Developers > API keys)
# Utiliser sk_test_... en développement, sk_live_... en production
STRIPE_SECRET_KEY=sk_test_... # ou sk_live_... en production

# Secret du webhook Stripe (trouvable après création du webhook)
STRIPE_WEBHOOK_SECRET=whsec_...

# IDs des prix Stripe pour les packs de crédits
# Créez ces prix dans Stripe Dashboard > Products
STRIPE_PRICE_10_EUR=price_... # Pack 50 crédits (10 EUR)
STRIPE_PRICE_29_EUR=price_... # Pack 200 crédits (29 EUR)

# IDs des prix Stripe pour les abonnements (optionnel)
STRIPE_ESSENTIAL_MONTHLY_PRICE_ID=price_... # Abonnement Essentiel Mensuel
STRIPE_ESSENTIAL_YEARLY_PRICE_ID=price_... # Abonnement Essentiel Annuel
STRIPE_PRO_MONTHLY_PRICE_ID=price_... # Abonnement Pro Mensuel
STRIPE_PRO_YEARLY_PRICE_ID=price_... # Abonnement Pro Annuel
```

### Replicate

```env
# Token API Replicate (trouvable dans Account Settings > API tokens)
REPLICATE_API_TOKEN=r8_...

# Version du modèle Replicate pour le redesign
REPLICATE_MODEL_VERSION=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea85a1cee5981f6d364

# Version du modèle Replicate pour l'inpainting (optionnel)
REPLICATE_INPAINTING_MODEL_VERSION=stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd234c93f82c1a6c3771d8c

# Mode mock Replicate (pour les tests uniquement)
# Mettre à "false" ou retirer cette variable en production
REPLICATE_MOCK_MODE=true # ou false en production
```

### Next.js

```env
# URL du site (pour les redirections et webhooks)
# En développement : http://localhost:3000
# En production : https://votre-domaine.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # ou https://votre-domaine.com en production
```

### Environnement

```env
# Environnement d'exécution
NODE_ENV=development # ou "production" en production
```

---

## 🔧 Configuration Locale

### Créer le fichier `.env.local`

1. À la racine du projet, créez un fichier `.env.local`
2. Copiez toutes les variables ci-dessus
3. Remplacez les valeurs par vos vraies clés
4. **⚠️ Ne commitez JAMAIS ce fichier dans Git** (il est déjà dans `.gitignore`)

### Exemple de `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_10_EUR=price_1AbCdEfGhIjKlMnOpQrStUv
STRIPE_PRICE_29_EUR=price_1XyZaBcDeFgHiJkLmNoPqRs
REPLICATE_API_TOKEN=r8_AbCdEfGhIjKlMnOpQrStUvWxYz...
REPLICATE_MODEL_VERSION=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea85a1cee5981f6d364
REPLICATE_MOCK_MODE=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🌐 Configuration Vercel (Production)

Dans Vercel Dashboard > Settings > Environment Variables, ajoutez toutes les variables ci-dessus avec les valeurs de **production** :

### Variables à modifier pour la production

- `STRIPE_SECRET_KEY` : Utiliser `sk_live_...` (pas `sk_test_...`)
- `REPLICATE_MOCK_MODE` : Mettre à `false` ou retirer la variable
- `NEXT_PUBLIC_SITE_URL` : Mettre l'URL de production (ex: `https://votre-domaine.com`)
- `NODE_ENV` : Mettre à `production`

### Sélection des environnements

Pour chaque variable, sélectionner :
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

---

## 🔍 Où trouver les valeurs

### Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Sélectionner votre projet
3. Aller dans **Settings > API**
4. Copier :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ SECRÈTE)

### Stripe

1. Aller sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. **API keys** : Developers > API keys
   - **Secret key** → `STRIPE_SECRET_KEY`
3. **Webhooks** : Developers > Webhooks
   - Créer un webhook → **Signing secret** → `STRIPE_WEBHOOK_SECRET`
4. **Products** : Products > Add Product
   - Créer les produits et prix → **Price ID** → `STRIPE_PRICE_10_EUR`, etc.

### Replicate

1. Aller sur [replicate.com](https://replicate.com)
2. Account Settings > API tokens
   - Créer un token → `REPLICATE_API_TOKEN`
3. Models : Chercher le modèle et copier la version
   - **SDXL** → `REPLICATE_MODEL_VERSION`
   - **Inpainting** → `REPLICATE_INPAINTING_MODEL_VERSION`

---

## ⚠️ Sécurité

### Variables Publiques (NEXT_PUBLIC_*)

Ces variables sont exposées côté client et peuvent être vues dans le code JavaScript :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

**⚠️ Ne jamais mettre de secrets dans les variables `NEXT_PUBLIC_*`**

### Variables Secrètes

Ces variables ne doivent **JAMAIS** être exposées côté client :

- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ SECRÈTE
- `STRIPE_SECRET_KEY` ⚠️ SECRÈTE
- `STRIPE_WEBHOOK_SECRET` ⚠️ SECRÈTE
- `REPLICATE_API_TOKEN` ⚠️ SECRÈTE

**⚠️ Ne jamais commiter ces variables dans Git**

---

## ✅ Vérification

Pour vérifier que toutes les variables sont configurées :

1. **Local** : Vérifier que `.env.local` existe et contient toutes les variables
2. **Vercel** : Vérifier dans Settings > Environment Variables que toutes les variables sont présentes
3. **Build** : Exécuter `npm run build` pour vérifier qu'il n'y a pas d'erreur

---

## 📝 Notes

- Les variables `NEXT_PUBLIC_*` sont accessibles côté client via `process.env.NEXT_PUBLIC_*`
- Les autres variables sont accessibles uniquement côté serveur via `process.env.*`
- En production, Vercel injecte automatiquement les variables d'environnement
- Le fichier `.env.local` est ignoré par Git (déjà dans `.gitignore`)




