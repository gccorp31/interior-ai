# 🚀 Guide de Déploiement Étape par Étape - MonDécorateurIA

Ce guide vous accompagne étape par étape pour déployer l'application en production.

---

## ✅ Étape 0 : Vérification Locale (Déjà Fait)

- ✅ Build fonctionne : `npm run build` ✅
- ✅ Tests E2E passent : `npm run test:e2e` ✅ (3/3 tests passent)
- ✅ Scripts SQL créés : `scripts/complete-supabase-setup.sql` ✅
- ✅ Scripts de vérification créés : `scripts/check-supabase-setup.sql` ✅
- ✅ Configuration Vercel créée : `vercel.json`, `.vercelignore` ✅
- ✅ Documentation complète ✅

---

## 🗄️ Étape 1 : Configurer Supabase en Production

### 1.1 Créer le Projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Se connecter ou créer un compte
3. Cliquer sur "New Project"
4. Remplir les informations :
   - **Name** : `mon-decorateur-ia-production` (ou votre nom)
   - **Database Password** : Choisir un mot de passe fort
   - **Region** : Choisir la région la plus proche
5. Cliquer sur "Create new project"
6. Attendre que le projet soit créé (2-3 minutes)

### 1.2 Récupérer les Clés API

1. Dans Supabase Dashboard, aller dans **Settings > API**
2. Noter les informations suivantes dans le fichier `VALEURS_PRODUCTION.md` :
   - **Project URL** : `https://xxxxx.supabase.co` → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ SECRÈTE

   **💡 Astuce** : Ouvrez le fichier `VALEURS_PRODUCTION.md` et copiez-y ces valeurs. Vous les utiliserez plus tard dans Vercel.

### 1.3 Exécuter le Script SQL

1. Aller dans **SQL Editor** dans le menu de gauche
2. Cliquer sur "New query"
3. Ouvrir le fichier `scripts/complete-supabase-setup.sql` dans votre éditeur
4. Copier tout le contenu du fichier
5. Coller dans l'éditeur SQL de Supabase
6. Cliquer sur "Run" (ou appuyer sur `Ctrl+Enter`)
7. Vérifier qu'il n'y a pas d'erreur
8. Vous devriez voir des messages de confirmation : `✅ Configuration Supabase terminée avec succès!`

### 1.4 Vérifier la Configuration

1. Dans SQL Editor, créer une nouvelle query
2. Ouvrir le fichier `scripts/check-supabase-setup.sql`
3. Copier tout le contenu
4. Coller dans l'éditeur SQL
5. Cliquer sur "Run"
6. Vérifier que tous les éléments affichent `✅`

### 1.5 Créer le Bucket Storage

1. Aller dans **Storage** dans le menu de gauche
2. Cliquer sur "Buckets"
3. Cliquer sur "New bucket"
4. Configuration :
   - **Name** : `uploads`
   - **Public bucket** : ✅ Activé
   - **File size limit** : `10` MB (ou selon vos besoins)
   - **Allowed MIME types** : `image/*`
5. Cliquer sur "Create bucket"

### 1.6 Vérifier le Storage

1. Dans SQL Editor, créer une nouvelle query
2. Ouvrir le fichier `scripts/check-storage-setup.sql`
3. Copier tout le contenu
4. Coller dans l'éditeur SQL
5. Cliquer sur "Run"
6. Vérifier que le bucket `uploads` existe et que les politiques sont créées

---

## 💳 Étape 2 : Configurer Stripe en Production

### 2.1 Passer en Mode LIVE

1. Aller sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Se connecter ou créer un compte
3. ⚠️ **IMPORTANT** : Cliquer sur le toggle en haut à droite pour passer en mode **LIVE**
   - Le toggle doit afficher "Live mode" (pas "Test mode")
   - L'URL doit contenir `/live` (pas `/test`)

### 2.2 Créer le Produit "Pack Découverte" (50 crédits - 10 EUR)

1. Aller dans **Products** dans le menu de gauche
2. Cliquer sur "Add product"
3. Remplir les informations :
   - **Name** : `Pack Découverte`
   - **Description** : `50 crédits pour générer vos images`
   - **Pricing** :
     - **Price** : `10.00`
     - **Currency** : `EUR`
     - **Billing period** : `One time`
   - **Metadata** (optionnel) :
     - `credit_amount` : `50`
4. Cliquer sur "Save product"
5. **Noter le Price ID** : Il commence par `price_...` → `STRIPE_PRICE_10_EUR`

### 2.3 Créer le Produit "Pack Pro" (200 crédits - 29 EUR)

1. Dans **Products**, cliquer sur "Add product"
2. Remplir les informations :
   - **Name** : `Pack Pro`
   - **Description** : `200 crédits pour générer vos images`
   - **Pricing** :
     - **Price** : `29.00`
     - **Currency** : `EUR`
     - **Billing period** : `One time`
   - **Metadata** (optionnel) :
     - `credit_amount` : `200`
3. Cliquer sur "Save product"
4. **Noter le Price ID** : Il commence par `price_...` → `STRIPE_PRICE_29_EUR`

### 2.4 Récupérer la Clé Secrète LIVE

1. Aller dans **Developers > API keys**
2. ⚠️ **IMPORTANT** : Vérifier que vous êtes en mode **LIVE** (pas Test)
3. Dans la section "Secret key", cliquer sur "Reveal test key" ou "Reveal live key"
4. **Noter la clé** : Elle commence par `sk_live_...` → `STRIPE_SECRET_KEY`
   - ⚠️ **NE JAMAIS** utiliser `sk_test_...` en production

### 2.5 Configurer les Webhooks (Après le Déploiement Vercel)

⚠️ **Note** : Cette étape doit être faite **APRÈS** le déploiement sur Vercel pour avoir l'URL de production.

1. Aller dans **Developers > Webhooks**
2. Cliquer sur "Add endpoint"
3. **Endpoint URL** : `https://votre-projet.vercel.app/api/webhook/stripe`
   - ⚠️ Remplacer `votre-projet.vercel.app` par votre URL Vercel
4. **Description** : `Webhook pour MonDécorateurIA`
5. **Events to send** : Sélectionner :
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created` (si vous utilisez les abonnements)
   - ✅ `customer.subscription.updated` (si vous utilisez les abonnements)
   - ✅ `customer.subscription.deleted` (si vous utilisez les abonnements)
   - ✅ `invoice.payment_succeeded` (si vous utilisez les abonnements)
6. Cliquer sur "Add endpoint"
7. **Noter le Signing secret** : Il commence par `whsec_...` → `STRIPE_WEBHOOK_SECRET`

---

## 🎨 Étape 3 : Configurer Replicate

### 3.1 Vérifier le Token API

1. Aller sur [replicate.com](https://replicate.com)
2. Se connecter ou créer un compte
3. Aller dans **Account Settings > API tokens**
4. Vous devriez voir vos tokens existants

**Quel token utiliser ?**
- ✅ **Option 1 (Recommandée)** : Utiliser le token que vous avez créé au début (celui qui fonctionne déjà en développement)
- ✅ **Option 2** : Utiliser le token par défaut (si vous préférez)
- ✅ **Option 3** : Créer un nouveau token spécifique pour la production (optionnel, pour une meilleure organisation)

**💡 Astuce** : Si votre token actuel fonctionne en développement, utilisez-le aussi en production. Tous les tokens d'un même compte Replicate ont accès aux mêmes crédits.

5. **Noter le token choisi** dans `VALEURS_PRODUCTION.md` : Il commence par `r8_...` → `REPLICATE_API_TOKEN`
6. Vérifier le solde de crédits disponibles (tous les tokens partagent le même solde)

### 3.2 Noter les Versions des Modèles

Les versions des modèles sont déjà configurées dans le code :
- **Redesign** : `stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea85a1cee5981f6d364`
- **Inpainting** : `stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd234c93f82c1a6c3771d8c`

---

## 🌐 Étape 4 : Déployer sur Vercel

### 4.1 Créer le Projet Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Se connecter avec votre compte GitHub/GitLab/Bitbucket
3. Cliquer sur "Add New Project"
4. Importer votre repository Git
5. Vercel détectera automatiquement Next.js
6. Configuration :
   - **Framework Preset** : Next.js (détecté automatiquement)
   - **Root Directory** : `./` (par défaut)
   - **Build Command** : `npm run build` (par défaut)
   - **Output Directory** : `.next` (par défaut)
   - **Install Command** : `npm install` (par défaut)

### 4.2 Configurer les Variables d'Environnement

Dans Vercel Dashboard, **AVANT** de cliquer sur "Deploy", aller dans **Settings > Environment Variables** et ajouter toutes les variables suivantes :

#### Variables Supabase

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

#### Variables Stripe

```
STRIPE_SECRET_KEY=sk_live_... # ⚠️ Utiliser la clé LIVE
STRIPE_WEBHOOK_SECRET=whsec_... # À configurer après le déploiement
STRIPE_PRICE_10_EUR=price_... # Price ID du Pack Découverte
STRIPE_PRICE_29_EUR=price_... # Price ID du Pack Pro
```

#### Variables Replicate

```
REPLICATE_API_TOKEN=r8_...
REPLICATE_MODEL_VERSION=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea85a1cee5981f6d364
REPLICATE_INPAINTING_MODEL_VERSION=stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd234c93f82c1a6c3771d8c
REPLICATE_MOCK_MODE=false # ⚠️ IMPORTANT : Désactiver le mode mock
```

#### Variables Next.js

```
NEXT_PUBLIC_SITE_URL=https://votre-projet.vercel.app # Mettre à jour après le déploiement
NODE_ENV=production
```

**⚠️ Important** :
- Pour chaque variable, sélectionner **Production**, **Preview**, et **Development**
- Utiliser les clés **LIVE** de Stripe (pas les clés de test)
- Mettre `REPLICATE_MOCK_MODE=false` en production

### 4.3 Déployer

1. Après avoir configuré toutes les variables, retourner dans **Deployments**
2. Cliquer sur "Deploy"
3. Attendre que le déploiement se termine (2-5 minutes)
4. Vérifier les logs de build pour s'assurer qu'il n'y a pas d'erreur
5. Une fois le déploiement terminé, noter l'URL : `https://votre-projet.vercel.app`

### 4.4 Mettre à Jour NEXT_PUBLIC_SITE_URL

1. Dans Vercel Dashboard > Settings > Environment Variables
2. Trouver `NEXT_PUBLIC_SITE_URL`
3. Modifier la valeur avec votre URL Vercel : `https://votre-projet.vercel.app`
4. Sauvegarder
5. Redéployer (Vercel redéploiera automatiquement)

### 4.5 Configurer le Domaine Personnalisé (Optionnel)

1. Dans Vercel Dashboard > Settings > Domains
2. Cliquer sur "Add domain"
3. Entrer votre domaine personnalisé (ex: `mondecorateuria.com`)
4. Suivre les instructions pour configurer les DNS
5. Une fois le domaine configuré, mettre à jour `NEXT_PUBLIC_SITE_URL` avec votre domaine personnalisé

---

## 🔄 Étape 5 : Finaliser la Configuration Stripe

### 5.1 Mettre à Jour les Webhooks Stripe

1. Aller dans Stripe Dashboard > Developers > Webhooks
2. Modifier l'endpoint existant (ou créer un nouveau)
3. **Endpoint URL** : `https://votre-projet.vercel.app/api/webhook/stripe`
   - ⚠️ Remplacer par votre URL Vercel réelle
4. Sauvegarder
5. **Noter le Signing secret** : Il commence par `whsec_...`
6. Mettre à jour `STRIPE_WEBHOOK_SECRET` dans Vercel avec ce secret

---

## ✅ Étape 6 : Tests Post-Déploiement

### 6.1 Tests Fonctionnels

1. **Flux anonyme** :
   - Aller sur `https://votre-projet.vercel.app`
   - Uploader une image
   - Générer une image (première génération gratuite)
   - Vérifier que le watermark est visible
   - Générer une deuxième image
   - Vérifier que le modal d'inscription apparaît

2. **Inscription** :
   - Cliquer sur "Créer un compte" dans le modal
   - Remplir le formulaire d'inscription
   - Vérifier que l'utilisateur est redirigé vers la page d'accueil

3. **Connexion** :
   - Aller sur `/login`
   - Se connecter avec le compte créé
   - Vérifier que l'utilisateur est connecté

4. **Génération d'image (mode réel)** :
   - Uploader une image
   - Générer une image
   - ⚠️ **ATTENTION** : La génération réelle prend 1-2 minutes (pas instantanée comme en mode mock)
   - Vérifier que l'image est générée sans watermark

5. **Décrémentation crédits** :
   - Aller sur `/account`
   - Noter le nombre de crédits (devrait être 5)
   - Générer une image
   - Retourner sur `/account`
   - Vérifier que les crédits passent à 4

6. **Achat pack crédits** :
   - Aller sur `/pricing`
   - Cliquer sur "Acheter" pour un pack
   - ⚠️ **ATTENTION** : En mode LIVE, vous serez redirigé vers Stripe Checkout réel
   - Utiliser une carte de test Stripe : `4242 4242 4242 4242`
   - Compléter le paiement
   - Vérifier que les crédits sont ajoutés

7. **Galerie d'inspiration** :
   - Aller sur `/inspiration`
   - Vérifier que la page se charge correctement

8. **Publication galerie** :
   - Sur la page d'accueil, trouver une image générée
   - Cliquer sur "Partager dans la galerie"
   - Aller sur `/inspiration`
   - Vérifier que l'image est visible

### 6.2 Tests de Performance

- [ ] **Temps de chargement** : Pages chargent en < 3 secondes
- [ ] **Temps de génération** : Génération d'image acceptable (< 2 minutes)
- [ ] **Temps de réponse API** : APIs répondent en < 1 seconde

### 6.3 Tests de Sécurité

- [ ] **Variables d'environnement** : Vérifier qu'elles ne sont pas exposées côté client
  - Ouvrir les DevTools > Console
  - Vérifier qu'aucune variable secrète n'est visible
- [ ] **RLS actif** : Vérifier dans Supabase que RLS est actif
- [ ] **Webhooks sécurisés** : Vérifier que les webhooks Stripe sont sécurisés

---

## 🔧 Dépannage

### Problème : Build échoue sur Vercel

**Solution** :
1. Vérifier les logs de build dans Vercel
2. Vérifier que toutes les variables d'environnement sont configurées
3. Vérifier que `npm run build` fonctionne en local

### Problème : Erreurs 500

**Solution** :
1. Vérifier les logs de runtime dans Vercel
2. Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est correcte
3. Vérifier que les webhooks Stripe sont configurés

### Problème : Générations d'images échouent

**Solution** :
1. Vérifier que `REPLICATE_MOCK_MODE=false`
2. Vérifier que `REPLICATE_API_TOKEN` est valide
3. Vérifier les crédits Replicate disponibles
4. Vérifier les logs dans Vercel pour voir l'erreur exacte

### Problème : Les crédits ne se décrémentent pas

**Solution** :
1. Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est correcte
2. Vérifier que les politiques RLS sont créées (exécuter `scripts/check-supabase-setup.sql`)
3. Vérifier les logs dans Vercel pour voir l'erreur exacte

---

## 📝 Checklist Finale

### Avant le Déploiement
- [ ] Build fonctionne en local (`npm run build`)
- [ ] Tests E2E passent (`npm run test:e2e`)
- [ ] Supabase configuré (tables, RLS, Storage)
- [ ] Stripe configuré (produits, prix)
- [ ] Replicate configuré (token)

### Déploiement
- [ ] Projet Vercel créé
- [ ] Variables d'environnement configurées
- [ ] Déploiement réussi
- [ ] URL Vercel notée

### Après le Déploiement
- [ ] `NEXT_PUBLIC_SITE_URL` mis à jour avec l'URL Vercel
- [ ] Webhooks Stripe configurés avec l'URL de production
- [ ] Tests post-déploiement passés
- [ ] Domaine personnalisé configuré (optionnel)

---

## 🎉 Félicitations !

Votre application est maintenant déployée en production ! 🚀

**Prochaines étapes** :
- Monitorer les performances
- Surveiller les erreurs
- Collecter les retours utilisateurs
- Améliorer l'application selon les retours
