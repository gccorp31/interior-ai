# 🚀 Guide de Déploiement sur Vercel

Ce guide vous accompagne étape par étape pour déployer MonDécorateurIA sur Vercel.

---

## 📋 Prérequis

- ✅ Compte Vercel (gratuit)
- ✅ Compte Supabase (gratuit)
- ✅ Compte Stripe (gratuit en mode test)
- ✅ Compte Replicate (gratuit avec crédits limités)
- ✅ Repository Git (GitHub, GitLab, ou Bitbucket)

---

## 🔧 Étape 1 : Préparer le Repository

### 1.1 Vérifier que le build fonctionne

```bash
npm run build
```

Si le build échoue, corriger les erreurs avant de continuer.

### 1.2 Pousser le code sur Git

```bash
git add .
git commit -m "Prêt pour le déploiement"
git push origin main
```

---

## 🌐 Étape 2 : Créer le Projet Vercel

### 2.1 Connecter le Repository

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur "Add New Project"
3. Importer votre repository Git
4. Vercel détectera automatiquement Next.js

### 2.2 Configuration du Projet

- **Framework Preset** : Next.js (détecté automatiquement)
- **Root Directory** : `./` (par défaut)
- **Build Command** : `npm run build` (par défaut)
- **Output Directory** : `.next` (par défaut)
- **Install Command** : `npm install` (par défaut)

---

## 🔐 Étape 3 : Configurer les Variables d'Environnement

Dans Vercel Dashboard > Settings > Environment Variables, ajouter toutes les variables suivantes :

### Variables Supabase

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

### Variables Stripe

```
STRIPE_SECRET_KEY=sk_live_... # Utiliser la clé LIVE en production
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_10_EUR=price_...
STRIPE_PRICE_29_EUR=price_...
STRIPE_ESSENTIAL_MONTHLY_PRICE_ID=price_...
STRIPE_ESSENTIAL_YEARLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
```

### Variables Replicate

```
REPLICATE_API_TOKEN=r8_...
REPLICATE_MODEL_VERSION=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea85a1cee5981f6d364
REPLICATE_INPAINTING_MODEL_VERSION=stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd234c93f82c1a6c3771d8c
REPLICATE_MOCK_MODE=false # IMPORTANT : Désactiver le mode mock en production
```

### Variables Next.js

```
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com
NODE_ENV=production
```

**⚠️ Important** : 
- Sélectionner **Production**, **Preview**, et **Development** pour chaque variable
- Ne JAMAIS commiter les variables d'environnement dans Git
- Utiliser les clés **LIVE** de Stripe en production (pas les clés de test)

---

## 🗄️ Étape 4 : Configurer Supabase en Production

### 4.1 Créer un Projet Supabase de Production

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet (ou utiliser le projet existant)
3. Noter l'URL et les clés API

### 4.2 Exécuter les Scripts SQL

Dans Supabase Dashboard > SQL Editor, exécuter les scripts suivants dans l'ordre :

1. **Créer la table `user_profiles`** (si elle n'existe pas)
   ```sql
   CREATE TABLE IF NOT EXISTS user_profiles (
     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     credit_balance INTEGER DEFAULT 5,
     plan TEXT DEFAULT 'Découverte',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **Créer la table `generations`** (si elle n'existe pas)
   ```sql
   CREATE TABLE IF NOT EXISTS generations (
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
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Activer RLS et créer les politiques**
   - Exécuter le script `scripts/add-user-profiles-update-policy.sql`
   - Vérifier que RLS est activé sur toutes les tables

### 4.3 Configurer le Storage

1. Aller dans Storage > Buckets
2. Créer un bucket `uploads` (s'il n'existe pas)
3. Configurer les politiques de stockage pour permettre l'upload public

---

## 💳 Étape 5 : Configurer Stripe en Production

### 5.1 Créer les Produits et Prix

1. Aller sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Passer en mode **LIVE** (toggle en haut à droite)
3. Créer les produits et prix :
   - Pack 50 crédits : 10 EUR
   - Pack 200 crédits : 29 EUR
   - (Optionnel) Abonnements Essentiel et Pro
4. Noter les Price IDs et les ajouter dans Vercel

### 5.2 Configurer les Webhooks

1. Aller dans Developers > Webhooks
2. Cliquer sur "Add endpoint"
3. URL : `https://votre-domaine.com/api/webhook/stripe`
4. Sélectionner les événements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
5. Copier le **Signing secret** et l'ajouter dans Vercel comme `STRIPE_WEBHOOK_SECRET`

---

## 🎨 Étape 6 : Configurer Replicate

### 6.1 Vérifier le Token API

1. Aller sur [replicate.com](https://replicate.com)
2. Vérifier que le token API est valide
3. Vérifier les crédits disponibles

### 6.2 Désactiver le Mode Mock

**IMPORTANT** : Dans Vercel, mettre `REPLICATE_MOCK_MODE=false` ou retirer la variable.

---

## 🚀 Étape 7 : Déployer

### 7.1 Déployer sur Vercel

1. Dans Vercel Dashboard, cliquer sur "Deploy"
2. Attendre que le déploiement se termine
3. Vérifier les logs de build pour s'assurer qu'il n'y a pas d'erreur

### 7.2 Vérifier le Déploiement

1. Cliquer sur le lien de déploiement (ex: `votre-projet.vercel.app`)
2. Vérifier que la page se charge correctement
3. Tester l'authentification
4. Tester une génération d'image (en mode réel, pas mock)

---

## 🌍 Étape 8 : Configurer le Domaine Personnalisé (Optionnel)

### 8.1 Ajouter un Domaine

1. Dans Vercel Dashboard > Settings > Domains
2. Ajouter votre domaine personnalisé
3. Suivre les instructions pour configurer les DNS

### 8.2 Mettre à Jour les Variables d'Environnement

Mettre à jour `NEXT_PUBLIC_SITE_URL` avec votre domaine personnalisé.

### 8.3 Mettre à Jour les Webhooks Stripe

Mettre à jour l'URL du webhook Stripe avec votre domaine personnalisé.

---

## ✅ Étape 9 : Tests Post-Déploiement

### 9.1 Tests Fonctionnels

- [ ] Test du flux anonyme (2 générations gratuites)
- [ ] Test de l'inscription
- [ ] Test de la connexion
- [ ] Test de la génération d'image (mode réel)
- [ ] Test de la décrémentation des crédits
- [ ] Test de l'achat de pack de crédits
- [ ] Test de la galerie d'inspiration
- [ ] Test de la publication dans la galerie

### 9.2 Tests de Performance

- [ ] Temps de chargement des pages (< 3 secondes)
- [ ] Temps de génération d'image (acceptable)
- [ ] Temps de réponse des API (< 1 seconde)

### 9.3 Tests de Sécurité

- [ ] Vérifier que les variables d'environnement ne sont pas exposées
- [ ] Vérifier que RLS est actif sur Supabase
- [ ] Vérifier que les webhooks Stripe sont sécurisés

---

## 🔧 Dépannage

### Problème : Build échoue

- Vérifier les logs de build dans Vercel
- Vérifier que toutes les variables d'environnement sont configurées
- Vérifier que `npm run build` fonctionne en local

### Problème : Erreurs 500

- Vérifier les logs de runtime dans Vercel
- Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est correcte
- Vérifier que les webhooks Stripe sont configurés

### Problème : Générations d'images échouent

- Vérifier que `REPLICATE_MOCK_MODE=false`
- Vérifier que `REPLICATE_API_TOKEN` est valide
- Vérifier les crédits Replicate disponibles

---

## 📝 Checklist de Déploiement

- [ ] Build fonctionne en local (`npm run build`)
- [ ] Code poussé sur Git
- [ ] Projet Vercel créé
- [ ] Toutes les variables d'environnement configurées
- [ ] Supabase configuré (tables, RLS, Storage)
- [ ] Stripe configuré (produits, prix, webhooks)
- [ ] Replicate configuré (token, mode mock désactivé)
- [ ] Déploiement réussi
- [ ] Tests post-déploiement passés
- [ ] Domaine personnalisé configuré (optionnel)

---

## 🎉 Félicitations !

Votre application est maintenant déployée en production ! 🚀




