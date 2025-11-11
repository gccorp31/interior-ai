# 🚀 Guide de Démarrage Vercel - Étape par Étape

Ce guide vous accompagne pour créer votre projet Vercel et déployer votre application.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ Votre code sur GitHub/GitLab/Bitbucket (repository Git)
- ✅ Les valeurs Supabase de production notées dans `VALEURS_PRODUCTION.md`
- ✅ Les valeurs Stripe de TEST notées dans `VALEURS_PRODUCTION.md`
- ✅ La valeur Replicate notée dans `VALEURS_PRODUCTION.md`

---

## 🎯 Étape 1 : Créer un Compte Vercel

### 1.1 Aller sur Vercel

1. Ouvrez votre navigateur
2. Allez sur [vercel.com](https://vercel.com)
3. Cliquez sur **"Sign Up"** (en haut à droite)

### 1.2 Se Connecter avec GitHub/GitLab/Bitbucket

1. Choisissez **"Continue with GitHub"** (ou GitLab/Bitbucket selon votre choix)
2. Autorisez Vercel à accéder à votre compte Git
3. Votre compte Vercel est maintenant créé ! ✅

---

## 🎯 Étape 2 : Créer un Nouveau Projet

### 2.1 Importer votre Repository

1. Dans le Dashboard Vercel, cliquez sur **"Add New Project"** (ou **"New Project"**)
2. Vous verrez la liste de vos repositories Git
3. **Trouvez votre repository** `mon-decorateur-ia` (ou le nom de votre repo)
4. Cliquez sur **"Import"** à côté de votre repository

### 2.2 Configuration du Projet

Vercel détectera automatiquement Next.js. Vous verrez une page de configuration :

**Framework Preset** : `Next.js` (détecté automatiquement) ✅
**Root Directory** : `./` (par défaut) ✅
**Build Command** : `npm run build` (par défaut) ✅
**Output Directory** : `.next` (par défaut) ✅
**Install Command** : `npm install` (par défaut) ✅

**⚠️ NE CLIQUEZ PAS ENCORE SUR "DEPLOY" !**

---

## 🎯 Étape 3 : Configurer les Variables d'Environnement

**⚠️ IMPORTANT** : Configurez les variables AVANT de déployer !

### 3.1 Ouvrir la Section Variables

1. Sur la page de configuration du projet, **faites défiler vers le bas**
2. Trouvez la section **"Environment Variables"**
3. Cliquez sur **"Add"** ou **"Add Variable"**

### 3.2 Ajouter les Variables Supabase

Pour chaque variable, suivez ces étapes :

1. **Key** : Tapez le nom de la variable (ex: `NEXT_PUBLIC_SUPABASE_URL`)
2. **Value** : Copiez la valeur depuis `VALEURS_PRODUCTION.md`
3. **Environments** : Cochez les 3 cases :
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
4. Cliquez sur **"Add"** ou **"Save"**

**Variables Supabase à ajouter** :

```
NEXT_PUBLIC_SUPABASE_URL=[Votre Project URL de production]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Votre anon public key de production]
SUPABASE_SERVICE_ROLE_KEY=[Votre service_role key de production]
```

### 3.3 Ajouter les Variables Stripe (Mode TEST)

**Variables Stripe à ajouter** :

```
STRIPE_SECRET_KEY=[Votre clé secrète de TEST - sk_test_...]
STRIPE_PRICE_10_EUR=[Votre Price ID de TEST pour Pack Découverte]
STRIPE_PRICE_29_EUR=[Votre Price ID de TEST pour Pack Pro]
```

**⚠️ Note** : `STRIPE_WEBHOOK_SECRET` sera ajouté APRÈS le déploiement

### 3.4 Ajouter les Variables Replicate

**Variables Replicate à ajouter** :

```
REPLICATE_API_TOKEN=[Votre token API Replicate - r8_...]
REPLICATE_MODEL_VERSION=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea85a1cee5981f6d364
REPLICATE_INPAINTING_MODEL_VERSION=stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd234c93f82c1a6c3771d8c
REPLICATE_MOCK_MODE=false
```

### 3.5 Ajouter les Variables Next.js

**Variables Next.js à ajouter** :

```
NODE_ENV=production
```

**⚠️ Note** : `NEXT_PUBLIC_SITE_URL` sera ajouté APRÈS le déploiement

### 3.6 Vérifier Toutes les Variables

Vous devriez avoir **13 variables** configurées :

**Supabase (3)** :
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

**Stripe (3)** :
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_PRICE_10_EUR`
- ✅ `STRIPE_PRICE_29_EUR`

**Replicate (4)** :
- ✅ `REPLICATE_API_TOKEN`
- ✅ `REPLICATE_MODEL_VERSION`
- ✅ `REPLICATE_INPAINTING_MODEL_VERSION`
- ✅ `REPLICATE_MOCK_MODE`

**Next.js (1)** :
- ✅ `NODE_ENV`

**À ajouter après déploiement (2)** :
- ⏳ `NEXT_PUBLIC_SITE_URL`
- ⏳ `STRIPE_WEBHOOK_SECRET`

---

## 🎯 Étape 4 : Déployer

### 4.1 Lancer le Déploiement

1. Une fois toutes les variables configurées, **faites défiler vers le haut**
2. Cliquez sur le bouton **"Deploy"** (en bas de la page)
3. Vercel va maintenant :
   - Installer les dépendances (`npm install`)
   - Builder l'application (`npm run build`)
   - Déployer l'application

### 4.2 Attendre le Déploiement

- Le déploiement prend généralement **2-5 minutes**
- Vous verrez les logs en temps réel
- **⚠️ Ne fermez pas la page pendant le déploiement**

### 4.3 Vérifier le Résultat

Une fois terminé, vous verrez :

- ✅ **"Deployment successful"** ou **"Ready"**
- Une URL : `https://votre-projet.vercel.app`
- **📝 NOTEZ CETTE URL** : Vous en aurez besoin pour la suite !

---

## 🎯 Étape 5 : Finaliser la Configuration

### 5.1 Ajouter NEXT_PUBLIC_SITE_URL

1. Dans Vercel Dashboard, allez dans **Settings** (menu de gauche)
2. Cliquez sur **"Environment Variables"**
3. Cliquez sur **"Add Variable"**
4. **Key** : `NEXT_PUBLIC_SITE_URL`
5. **Value** : `https://votre-projet.vercel.app` (l'URL que vous avez notée)
6. **Environments** : ✅ Production, ✅ Preview, ✅ Development
7. Cliquez sur **"Save"**
8. Vercel redéploiera automatiquement avec la nouvelle variable

### 5.2 Configurer le Webhook Stripe

1. Allez sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. **⚠️ IMPORTANT** : Assurez-vous d'être en mode **TEST** (pas LIVE)
3. Allez dans **Developers > Webhooks**
4. Cliquez sur **"Add endpoint"** (ou modifiez l'existant)
5. **Endpoint URL** : `https://votre-projet.vercel.app/api/webhook/stripe`
   - ⚠️ Remplacez `votre-projet.vercel.app` par votre URL Vercel réelle
6. **Description** : `Webhook pour MonDécorateurIA`
7. **Events to send** : Sélectionnez :
   - ✅ `checkout.session.completed`
8. Cliquez sur **"Add endpoint"**
9. **Copiez le Signing secret** : Il commence par `whsec_...`

### 5.3 Ajouter STRIPE_WEBHOOK_SECRET dans Vercel

1. Retournez dans Vercel Dashboard > Settings > Environment Variables
2. Cliquez sur **"Add Variable"**
3. **Key** : `STRIPE_WEBHOOK_SECRET`
4. **Value** : Le secret que vous avez copié (`whsec_...`)
5. **Environments** : ✅ Production, ✅ Preview, ✅ Development
6. Cliquez sur **"Save"**
7. Vercel redéploiera automatiquement

---

## ✅ Vérification Finale

### Checklist

- [ ] Compte Vercel créé
- [ ] Projet Vercel créé et connecté à votre repository Git
- [ ] 13 variables d'environnement configurées
- [ ] Déploiement réussi
- [ ] URL Vercel notée
- [ ] `NEXT_PUBLIC_SITE_URL` ajouté
- [ ] Webhook Stripe configuré
- [ ] `STRIPE_WEBHOOK_SECRET` ajouté

### Tester l'Application

1. Ouvrez votre URL Vercel : `https://votre-projet.vercel.app`
2. Testez les fonctionnalités :
   - [ ] Page d'accueil se charge
   - [ ] Upload d'image fonctionne
   - [ ] Génération d'image fonctionne (en mode réel, pas mock)
   - [ ] Inscription/Connexion fonctionne
   - [ ] Page `/account` affiche les crédits

---

## 🎉 Félicitations !

Votre application est maintenant déployée sur Vercel ! 🚀

---

## 🔧 Dépannage

### Le déploiement échoue

1. Vérifiez les logs de build dans Vercel
2. Vérifiez que toutes les variables d'environnement sont configurées
3. Vérifiez que `npm run build` fonctionne en local

### Erreurs 500 après le déploiement

1. Vérifiez les logs de runtime dans Vercel
2. Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est correcte
3. Vérifiez que toutes les variables sont présentes

### Les générations d'images ne fonctionnent pas

1. Vérifiez que `REPLICATE_MOCK_MODE=false`
2. Vérifiez que `REPLICATE_API_TOKEN` est valide
3. Vérifiez les crédits Replicate disponibles

---

## 📝 Résumé des Étapes

1. **Créer un compte Vercel** → Se connecter avec GitHub/GitLab/Bitbucket
2. **Créer un nouveau projet** → Importer votre repository
3. **Configurer les variables** → Ajouter les 13 variables d'environnement
4. **Déployer** → Cliquer sur "Deploy"
5. **Finaliser** → Ajouter `NEXT_PUBLIC_SITE_URL` et configurer le webhook Stripe

**Temps estimé** : 15-20 minutes

---

**💡 Astuce** : Gardez `VALEURS_PRODUCTION.md` et `COPIER_COLLER_VERCEL.md` ouverts pendant la configuration pour copier facilement les valeurs !

