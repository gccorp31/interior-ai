# 🔐 Variables d'Environnement pour Vercel - MonDécorateurIA

**⚠️ MODE TEST STRIPE** : Ce document contient les variables pour un déploiement avec Stripe en mode TEST (pas LIVE).

**📋 Instructions** :
1. Copiez chaque variable ci-dessous
2. Dans Vercel Dashboard > Settings > Environment Variables
3. Ajoutez chaque variable avec sa valeur
4. Sélectionnez **Production**, **Preview**, et **Development** pour chaque variable

---

## 🗄️ Variables Supabase (Production)

### NEXT_PUBLIC_SUPABASE_URL
```
[À remplir avec votre Project URL de production Supabase]
```
**Exemple** : `https://abcdefghijklmnop.supabase.co`
**Source** : Supabase Dashboard > Settings > API > Project URL
**⚠️ Important** : Utiliser les valeurs de PRODUCTION (pas de développement)

### NEXT_PUBLIC_SUPABASE_ANON_KEY
```
[À remplir avec votre anon public key de production Supabase]
```
**Exemple** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ...`
**Source** : Supabase Dashboard > Settings > API > anon public
**⚠️ Important** : Utiliser les valeurs de PRODUCTION (pas de développement)

### SUPABASE_SERVICE_ROLE_KEY
```
[À remplir avec votre service_role key de production Supabase]
```
**Exemple** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9...`
**Source** : Supabase Dashboard > Settings > API > service_role
**⚠️ SECRÈTE** : Ne jamais exposer cette clé côté client
**⚠️ Important** : Utiliser les valeurs de PRODUCTION (pas de développement)

---

## 💳 Variables Stripe (Mode TEST)

### STRIPE_SECRET_KEY
```
[À remplir avec votre clé secrète Stripe de TEST]
```
**Exemple** : `sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890...`
**Source** : Stripe Dashboard > Developers > API keys > Secret key (en mode TEST)
**⚠️ Important** : Utiliser `sk_test_...` (pas `sk_live_...`) car vous êtes en mode TEST

### STRIPE_WEBHOOK_SECRET
```
[À remplir avec votre webhook signing secret Stripe de TEST]
```
**Exemple** : `whsec_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890...`
**Source** : Stripe Dashboard > Developers > Webhooks > [Votre webhook] > Signing secret
**⚠️ Note** : À configurer APRÈS le déploiement sur Vercel (pour avoir l'URL de production)
**⚠️ Important** : Utiliser le secret du webhook en mode TEST

### STRIPE_PRICE_10_EUR
```
[À remplir avec votre Price ID du Pack Découverte (10 EUR) en mode TEST]
```
**Exemple** : `price_1AbCdEfGhIjKlMnOpQrStUv`
**Source** : Stripe Dashboard > Products > [Pack Découverte] > Price ID (en mode TEST)
**⚠️ Important** : Utiliser le Price ID en mode TEST (pas LIVE)

### STRIPE_PRICE_29_EUR
```
[À remplir avec votre Price ID du Pack Pro (29 EUR) en mode TEST]
```
**Exemple** : `price_1XyZaBcDeFgHiJkLmNoPqRs`
**Source** : Stripe Dashboard > Products > [Pack Pro] > Price ID (en mode TEST)
**⚠️ Important** : Utiliser le Price ID en mode TEST (pas LIVE)

---

## 🎨 Variables Replicate (Production)

### REPLICATE_API_TOKEN
```
[À remplir avec votre token API Replicate]
```
**Exemple** : `r8_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890...`
**Source** : Replicate Dashboard > Account Settings > API tokens
**⚠️ Important** : Utiliser le token que vous avez noté dans `VALEURS_PRODUCTION.md`

### REPLICATE_MODEL_VERSION
```
stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea85a1cee5981f6d364
```
**✅ Déjà configuré** : Cette valeur est fixe, copiez-la telle quelle

### REPLICATE_INPAINTING_MODEL_VERSION
```
stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd234c93f82c1a6c3771d8c
```
**✅ Déjà configuré** : Cette valeur est fixe, copiez-la telle quelle

### REPLICATE_MOCK_MODE
```
false
```
**⚠️ IMPORTANT** : Mettre à `false` en production pour utiliser les vraies générations Replicate
**✅ Déjà configuré** : Cette valeur est fixe, copiez-la telle quelle

---

## 🌐 Variables Next.js

### NEXT_PUBLIC_SITE_URL
```
[À remplir APRÈS le premier déploiement avec votre URL Vercel]
```
**Exemple** : `https://mon-decorateur-ia.vercel.app`
**Source** : URL fournie par Vercel après le déploiement
**⚠️ Note** : À mettre à jour APRÈS le premier déploiement sur Vercel

### NODE_ENV
```
production
```
**✅ Déjà configuré** : Cette valeur est fixe, copiez-la telle quelle

---

## 📋 Checklist de Configuration

### Avant de Configurer dans Vercel

- [ ] J'ai noté toutes les valeurs Supabase de production dans `VALEURS_PRODUCTION.md`
- [ ] J'ai noté toutes les valeurs Stripe de TEST dans `VALEURS_PRODUCTION.md`
- [ ] J'ai noté la valeur Replicate dans `VALEURS_PRODUCTION.md`

### Dans Vercel Dashboard

- [ ] **NEXT_PUBLIC_SUPABASE_URL** : Valeur de production Supabase
- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY** : Valeur de production Supabase
- [ ] **SUPABASE_SERVICE_ROLE_KEY** : Valeur de production Supabase
- [ ] **STRIPE_SECRET_KEY** : Valeur de TEST Stripe (`sk_test_...`)
- [ ] **STRIPE_WEBHOOK_SECRET** : Valeur de TEST Stripe (à configurer après déploiement)
- [ ] **STRIPE_PRICE_10_EUR** : Price ID de TEST Stripe
- [ ] **STRIPE_PRICE_29_EUR** : Price ID de TEST Stripe
- [ ] **REPLICATE_API_TOKEN** : Token Replicate
- [ ] **REPLICATE_MODEL_VERSION** : `stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea85a1cee5981f6d364`
- [ ] **REPLICATE_INPAINTING_MODEL_VERSION** : `stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd234c93f82c1a6c3771d8c`
- [ ] **REPLICATE_MOCK_MODE** : `false`
- [ ] **NEXT_PUBLIC_SITE_URL** : URL Vercel (à mettre à jour après déploiement)
- [ ] **NODE_ENV** : `production`

### Pour Chaque Variable

- [ ] Sélectionné **Production** ✅
- [ ] Sélectionné **Preview** ✅
- [ ] Sélectionné **Development** ✅

---

## 🔄 Après le Déploiement

### 1. Mettre à Jour NEXT_PUBLIC_SITE_URL

1. Dans Vercel Dashboard > Deployments
2. Noter l'URL de votre déploiement (ex: `https://mon-decorateur-ia.vercel.app`)
3. Aller dans Settings > Environment Variables
4. Trouver `NEXT_PUBLIC_SITE_URL`
5. Modifier la valeur avec votre URL Vercel
6. Sauvegarder (Vercel redéploiera automatiquement)

### 2. Configurer le Webhook Stripe

1. Dans Stripe Dashboard > Developers > Webhooks
2. Créer un nouveau webhook (ou modifier l'existant)
3. **Endpoint URL** : `https://votre-projet.vercel.app/api/webhook/stripe`
4. **Events** : Sélectionner `checkout.session.completed`
5. **Signing secret** : Copier le secret
6. Dans Vercel > Settings > Environment Variables
7. Mettre à jour `STRIPE_WEBHOOK_SECRET` avec le nouveau secret

---

## ⚠️ Points Importants

1. **Stripe en Mode TEST** : Toutes les clés Stripe doivent être en mode TEST (`sk_test_...`, Price IDs de TEST)
2. **Supabase en Production** : Utiliser les clés de votre projet Supabase de PRODUCTION
3. **Replicate** : Utiliser votre token API Replicate
4. **REPLICATE_MOCK_MODE** : ⚠️ **OBLIGATOIREMENT** `false` en production
5. **NEXT_PUBLIC_SITE_URL** : À mettre à jour après le premier déploiement

---

## 🎯 Résumé Rapide

**Variables à remplir avec vos valeurs** :
- `NEXT_PUBLIC_SUPABASE_URL` (production)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production)
- `SUPABASE_SERVICE_ROLE_KEY` (production)
- `STRIPE_SECRET_KEY` (TEST : `sk_test_...`)
- `STRIPE_WEBHOOK_SECRET` (TEST, après déploiement)
- `STRIPE_PRICE_10_EUR` (TEST)
- `STRIPE_PRICE_29_EUR` (TEST)
- `REPLICATE_API_TOKEN` (production)
- `NEXT_PUBLIC_SITE_URL` (après déploiement)

**Variables avec valeurs fixes** :
- `REPLICATE_MODEL_VERSION` : `stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea85a1cee5981f6d364`
- `REPLICATE_INPAINTING_MODEL_VERSION` : `stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd234c93f82c1a6c3771d8c`
- `REPLICATE_MOCK_MODE` : `false`
- `NODE_ENV` : `production`

---

## ✅ Vérification Finale

Après avoir configuré toutes les variables dans Vercel :

1. Vérifier que toutes les variables sont présentes
2. Vérifier que `REPLICATE_MOCK_MODE=false`
3. Vérifier que les clés Stripe sont en mode TEST (`sk_test_...`)
4. Vérifier que les clés Supabase sont de PRODUCTION
5. Déployer l'application
6. Mettre à jour `NEXT_PUBLIC_SITE_URL` après le déploiement
7. Configurer le webhook Stripe avec l'URL de production

---

**🎉 Une fois toutes les variables configurées, vous pouvez déployer sur Vercel !**

