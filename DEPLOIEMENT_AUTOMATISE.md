# 🤖 Déploiement Automatisé - MonDécorateurIA

Ce document liste les étapes automatisées et manuelles pour le déploiement.

---

## ✅ Étapes Automatisées (Déjà Faites)

### 1. Préparation du Code ✅
- ✅ Build de production fonctionne (`npm run build`)
- ✅ Tests E2E passent (`npm run test:e2e`)
- ✅ Scripts SQL créés pour Supabase
- ✅ Scripts de vérification créés
- ✅ Configuration Vercel créée (`vercel.json`, `.vercelignore`)
- ✅ Documentation complète créée

### 2. Scripts Créés ✅

#### Scripts SQL
- ✅ `scripts/setup-production-database.sql` : Configuration complète de la base de données
- ✅ `scripts/complete-supabase-setup.sql` : Script consolidé (tables + RLS + Storage)
- ✅ `scripts/setup-storage-uploads.sql` : Configuration du Storage
- ✅ `scripts/check-supabase-setup.sql` : Vérification de la configuration Supabase
- ✅ `scripts/check-storage-setup.sql` : Vérification du Storage

#### Scripts Node.js
- ✅ `scripts/verify-production-setup.mjs` : Vérification des variables d'environnement
- ✅ Commande : `npm run verify:production`

---

## ⚠️ Étapes Manuelles (À Faire)

### 1. Configurer Supabase en Production

#### 1.1 Créer le Projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet (ou utiliser le projet existant)
3. Noter l'URL et les clés API (Settings > API)

#### 1.2 Exécuter le Script SQL
1. Aller dans Supabase Dashboard > SQL Editor
2. **Option A** : Exécuter le script complet
   - Copier le contenu de `scripts/complete-supabase-setup.sql`
   - Coller dans l'éditeur SQL
   - Cliquer sur "Run"
   
   **OU**
   
   **Option B** : Exécuter les scripts séparément
   - Exécuter `scripts/setup-production-database.sql`
   - Exécuter `scripts/setup-storage-uploads.sql`

3. Vérifier la configuration :
   - Exécuter `scripts/check-supabase-setup.sql`
   - Exécuter `scripts/check-storage-setup.sql`

#### 1.3 Créer le Bucket Storage
1. Aller dans Storage > Buckets
2. Cliquer sur "New bucket"
3. Configuration :
   - **Nom** : `uploads`
   - **Public** : ✅ Activé
   - **File size limit** : 10 MB (ou selon vos besoins)
   - **Allowed MIME types** : `image/*`
4. Cliquer sur "Create bucket"

#### 1.4 Vérifier les Politiques RLS
1. Aller dans Authentication > Policies
2. Vérifier que RLS est activé sur :
   - `user_profiles`
   - `generations`
3. Vérifier que les politiques suivantes existent :
   - `Users can view their own profile`
   - `Users can insert their own profile`
   - `Users can update their own profile`
   - `Users can view their own generations`
   - `Public can view published generations`
   - `Users can insert their own generations`
   - `Users can update their own generations`

---

### 2. Configurer Stripe en Production

#### 2.1 Passer en Mode LIVE
1. Aller sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Cliquer sur le toggle en haut à droite pour passer en mode **LIVE**
3. ⚠️ **IMPORTANT** : Utiliser les clés LIVE, pas les clés de test

#### 2.2 Créer les Produits et Prix
1. Aller dans Products > Add Product
2. Créer les produits suivants :

   **Pack 50 crédits (10 EUR)**
   - Name: "Pack Découverte"
   - Description: "50 crédits pour générer vos images"
   - Price: 10.00 EUR
   - Type: One-time payment
   - Noter le **Price ID** (commence par `price_...`)

   **Pack 200 crédits (29 EUR)**
   - Name: "Pack Pro"
   - Description: "200 crédits pour générer vos images"
   - Price: 29.00 EUR
   - Type: One-time payment
   - Noter le **Price ID** (commence par `price_...`)

#### 2.3 Configurer les Webhooks
1. Aller dans Developers > Webhooks
2. Cliquer sur "Add endpoint"
3. URL : `https://votre-domaine.com/api/webhook/stripe`
   - ⚠️ **Note** : Utiliser l'URL de production après le déploiement sur Vercel
4. Sélectionner les événements :
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created` (si vous utilisez les abonnements)
   - ✅ `customer.subscription.updated` (si vous utilisez les abonnements)
   - ✅ `customer.subscription.deleted` (si vous utilisez les abonnements)
   - ✅ `invoice.payment_succeeded` (si vous utilisez les abonnements)
5. Cliquer sur "Add endpoint"
6. Copier le **Signing secret** (commence par `whsec_...`)

---

### 3. Configurer Replicate

#### 3.1 Vérifier le Token API
1. Aller sur [replicate.com](https://replicate.com)
2. Account Settings > API tokens
3. Vérifier que le token est valide
4. Vérifier le solde de crédits disponibles

#### 3.2 Noter les Versions des Modèles
Les versions des modèles sont déjà configurées dans le code :
- **Redesign** : `stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea85a1cee5981f6d364`
- **Inpainting** : `stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd234c93f82c1a6c3771d8c`

---

### 4. Déployer sur Vercel

#### 4.1 Créer le Projet Vercel
1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur "Add New Project"
3. Importer votre repository Git
4. Vercel détectera automatiquement Next.js

#### 4.2 Configurer les Variables d'Environnement
Dans Vercel Dashboard > Settings > Environment Variables, ajouter toutes les variables suivantes :

**Variables Supabase**
```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

**Variables Stripe**
```
STRIPE_SECRET_KEY=sk_live_... # ⚠️ Utiliser la clé LIVE
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_10_EUR=price_...
STRIPE_PRICE_29_EUR=price_...
```

**Variables Replicate**
```
REPLICATE_API_TOKEN=r8_...
REPLICATE_MODEL_VERSION=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea85a1cee5981f6d364
REPLICATE_INPAINTING_MODEL_VERSION=stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd234c93f82c1a6c3771d8c
REPLICATE_MOCK_MODE=false # ⚠️ IMPORTANT : Désactiver le mode mock
```

**Variables Next.js**
```
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com
NODE_ENV=production
```

**⚠️ Important** :
- Sélectionner **Production**, **Preview**, et **Development** pour chaque variable
- Utiliser les clés **LIVE** de Stripe (pas les clés de test)
- Mettre `REPLICATE_MOCK_MODE=false` en production

#### 4.3 Déployer
1. Cliquer sur "Deploy"
2. Attendre que le déploiement se termine
3. Vérifier les logs de build pour s'assurer qu'il n'y a pas d'erreur

#### 4.4 Configurer le Domaine Personnalisé (Optionnel)
1. Dans Vercel Dashboard > Settings > Domains
2. Ajouter votre domaine personnalisé
3. Suivre les instructions pour configurer les DNS
4. Mettre à jour `NEXT_PUBLIC_SITE_URL` avec votre domaine personnalisé

#### 4.5 Mettre à Jour les Webhooks Stripe
1. Aller dans Stripe Dashboard > Developers > Webhooks
2. Modifier l'endpoint existant
3. Mettre à jour l'URL avec votre domaine Vercel : `https://votre-domaine.vercel.app/api/webhook/stripe`
4. Sauvegarder

---

### 5. Tests Post-Déploiement

#### 5.1 Tests Fonctionnels
- [ ] **Flux anonyme** : Tester 2 générations gratuites
- [ ] **Inscription** : Créer un compte
- [ ] **Connexion** : Se connecter avec le compte créé
- [ ] **Génération d'image** : Générer une image (mode réel, pas mock)
- [ ] **Décrémentation crédits** : Vérifier que les crédits passent de 5 à 4
- [ ] **Achat pack crédits** : Tester l'achat d'un pack (en mode test Stripe d'abord)
- [ ] **Ajout crédits** : Vérifier que les crédits sont ajoutés après achat
- [ ] **Galerie d'inspiration** : Vérifier que la page `/inspiration` est accessible
- [ ] **Publication galerie** : Tester le bouton "Partager dans la galerie"

#### 5.2 Tests de Performance
- [ ] **Temps de chargement** : Pages chargent en < 3 secondes
- [ ] **Temps de génération** : Génération d'image acceptable (< 2 minutes)
- [ ] **Temps de réponse API** : APIs répondent en < 1 seconde

#### 5.3 Tests de Sécurité
- [ ] **Variables d'environnement** : Vérifier qu'elles ne sont pas exposées côté client
- [ ] **RLS actif** : Vérifier dans Supabase que RLS est actif
- [ ] **Webhooks sécurisés** : Vérifier que les webhooks Stripe sont sécurisés

---

## 📋 Checklist Rapide

### Avant le Déploiement
- [ ] Build fonctionne en local (`npm run build`)
- [ ] Tests E2E passent (`npm run test:e2e`)
- [ ] Configuration vérifiée (`npm run verify:production`)
- [ ] Supabase configuré (tables, RLS, Storage)
- [ ] Stripe configuré (produits, prix, webhooks)
- [ ] Replicate configuré (token, mode mock désactivé)

### Déploiement
- [ ] Projet Vercel créé
- [ ] Variables d'environnement configurées
- [ ] Déploiement réussi
- [ ] Domaine personnalisé configuré (optionnel)

### Après le Déploiement
- [ ] Tests post-déploiement passés
- [ ] Webhooks Stripe mis à jour avec l'URL de production
- [ ] Application accessible et fonctionnelle

---

## 🎯 Résumé

**✅ Automatisé** : Code, scripts, documentation, configuration
**⚠️ Manuel** : Configuration des services externes (Supabase, Stripe, Replicate, Vercel)

**Temps estimé pour les étapes manuelles** : 1-2 heures

**Suivez les instructions ci-dessus pour finaliser le déploiement !**




