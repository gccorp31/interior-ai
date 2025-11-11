# 🎯 Guide Ultra Simple - Déploiement Vercel

**Vous êtes perdu ? Suivez ce guide étape par étape, ligne par ligne.**

---

## ✅ Étape 1 : Voir vos Repositories (2 minutes)

### 1.1 Aller sur la Page d'Accueil Vercel

1. Ouvrez [vercel.com](https://vercel.com)
2. **Connectez-vous** avec votre compte
3. Vous devriez voir le **Dashboard Vercel**

### 1.2 Créer un Nouveau Projet

1. **Cliquez sur le gros bouton** : **"Add New..."** ou **"New Project"** (en haut à droite ou au centre)
2. OU **Cliquez sur "Add New Project"** dans le menu de gauche

### 1.3 Voir vos Repositories

1. Vous devriez maintenant voir une page avec **"Import Git Repository"**
2. **En haut de la page**, vous verrez peut-être un onglet **"GitHub"** (ou GitLab/Bitbucket)
3. **Cliquez sur "GitHub"** si ce n'est pas déjà sélectionné
4. **Vous devriez voir la liste de vos repositories GitHub**

**❓ Vous ne voyez toujours rien ?**
- Cliquez sur **"Refresh"** ou **"Reload"** (si disponible)
- Ou déconnectez-vous et reconnectez-vous à Vercel

---

## ✅ Étape 2 : Trouver et Importer votre Repository (1 minute)

### 2.1 Chercher votre Repository

1. Dans la liste des repositories, **cherchez** `mon-decorateur-ia` (ou le nom de votre repository)
2. **Si vous ne le voyez pas** :
   - Utilisez la barre de recherche en haut
   - Ou faites défiler la liste

### 2.2 Importer le Repository

1. **Trouvez** `mon-decorateur-ia` dans la liste
2. **Cliquez sur le bouton "Import"** à côté du nom
3. OU **Cliquez directement sur le nom** du repository

---

## ✅ Étape 3 : Configurer le Projet (5 minutes)

### 3.1 Page de Configuration

Après avoir cliqué sur "Import", vous arrivez sur une page de configuration.

**Vous verrez** :
- **Project Name** : `mon-decorateur-ia` (vous pouvez le laisser tel quel)
- **Framework Preset** : `Next.js` (détecté automatiquement) ✅
- **Root Directory** : `./` (par défaut) ✅
- **Build Command** : `npm run build` (par défaut) ✅
- **Output Directory** : `.next` (par défaut) ✅

**⚠️ NE CLIQUEZ PAS ENCORE SUR "DEPLOY" !**

### 3.2 Faire Défiler vers le Bas

1. **Faites défiler la page vers le bas** (utilisez la molette de la souris)
2. **Cherchez la section** : **"Environment Variables"** ou **"Variables d'environnement"**
3. **Vous verrez** : Un bouton **"Add"** ou **"Add Variable"**

---

## ✅ Étape 4 : Ajouter les Variables d'Environnement (10 minutes)

**⚠️ IMPORTANT** : Ouvrez `VALEURS_PRODUCTION.md` dans un autre onglet pour copier les valeurs !

### 4.1 Ajouter la Première Variable

1. **Cliquez sur "Add"** ou **"Add Variable"**
2. **Key** : Tapez exactement : `NEXT_PUBLIC_SUPABASE_URL`
3. **Value** : Ouvrez `VALEURS_PRODUCTION.md` et copiez la valeur de `NEXT_PUBLIC_SUPABASE_URL`
4. **Environments** : Cochez les 3 cases :
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
5. **Cliquez sur "Add"** ou **"Save"**

### 4.2 Répéter pour Toutes les Variables

**Ajoutez ces variables une par une** (cliquez sur "Add" après chaque variable) :

**Variables Supabase (3)** :
1. `NEXT_PUBLIC_SUPABASE_URL` → Valeur depuis `VALEURS_PRODUCTION.md`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Valeur depuis `VALEURS_PRODUCTION.md`
3. `SUPABASE_SERVICE_ROLE_KEY` → Valeur depuis `VALEURS_PRODUCTION.md`

**Variables Stripe (3)** :
4. `STRIPE_SECRET_KEY` → Valeur depuis votre `.env.local` (commence par `sk_test_...`)
5. `STRIPE_PRICE_10_EUR` → Valeur depuis votre `.env.local` (commence par `price_...`)
6. `STRIPE_PRICE_29_EUR` → Valeur depuis votre `.env.local` (commence par `price_...`)

**Variables Replicate (4)** :
7. `REPLICATE_API_TOKEN` → Valeur depuis `VALEURS_PRODUCTION.md` (commence par `r8_...`)
8. `REPLICATE_MODEL_VERSION` → **Copiez exactement** : `stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea85a1cee5981f6d364`
9. `REPLICATE_INPAINTING_MODEL_VERSION` → **Copiez exactement** : `stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd234c93f82c1a6c3771d8c`
10. `REPLICATE_MOCK_MODE` → **Tapez exactement** : `false`

**Variables Next.js (1)** :
11. `NODE_ENV` → **Tapez exactement** : `production`

### 4.3 Vérifier

**Vous devriez avoir 11 variables** dans la liste.

**Si vous en avez moins** : Vérifiez que vous avez bien cliqué sur "Add" après chaque variable.

---

## ✅ Étape 5 : Déployer (5 minutes)

### 5.1 Lancer le Déploiement

1. **Remontez en haut de la page** (faites défiler vers le haut)
2. **Cherchez le bouton** : **"Deploy"** (généralement en bas de la page, en bleu)
3. **Cliquez sur "Deploy"**

### 5.2 Attendre

1. **Ne fermez pas la page** pendant le déploiement
2. Vous verrez les **logs en temps réel** :
   - "Installing dependencies..."
   - "Building..."
   - "Deploying..."
3. **Cela prend 2-5 minutes**

### 5.3 Résultat

**Quand c'est terminé**, vous verrez :

- ✅ **"Deployment successful"** ou **"Ready"**
- Une **URL** : `https://mon-decorateur-ia.vercel.app` (ou similaire)
- **📝 NOTEZ CETTE URL** : Vous en aurez besoin !

---

## ✅ Étape 6 : Finaliser (5 minutes)

### 6.1 Ajouter NEXT_PUBLIC_SITE_URL

1. Dans Vercel Dashboard, **cliquez sur "Settings"** (menu de gauche)
2. **Cliquez sur "Environment Variables"**
3. **Cliquez sur "Add Variable"**
4. **Key** : `NEXT_PUBLIC_SITE_URL`
5. **Value** : L'URL que vous avez notée (ex: `https://mon-decorateur-ia.vercel.app`)
6. **Environments** : ✅ Production, ✅ Preview, ✅ Development
7. **Cliquez sur "Save"**

### 6.2 Configurer le Webhook Stripe

1. **Allez sur** [dashboard.stripe.com](https://dashboard.stripe.com)
2. **⚠️ IMPORTANT** : Assurez-vous d'être en mode **TEST** (pas LIVE)
3. **Cliquez sur "Developers"** (menu de gauche)
4. **Cliquez sur "Webhooks"**
5. **Cliquez sur "Add endpoint"**
6. **Endpoint URL** : `https://votre-projet.vercel.app/api/webhook/stripe`
   - ⚠️ Remplacez `votre-projet.vercel.app` par votre URL Vercel réelle
7. **Events to send** : Cochez `checkout.session.completed`
8. **Cliquez sur "Add endpoint"**
9. **Copiez le "Signing secret"** (commence par `whsec_...`)

### 6.3 Ajouter STRIPE_WEBHOOK_SECRET

1. **Retournez dans Vercel** > Settings > Environment Variables
2. **Cliquez sur "Add Variable"**
3. **Key** : `STRIPE_WEBHOOK_SECRET`
4. **Value** : Le secret que vous avez copié (`whsec_...`)
5. **Environments** : ✅ Production, ✅ Preview, ✅ Development
6. **Cliquez sur "Save"**

---

## ✅ Étape 7 : Tester (2 minutes)

1. **Ouvrez votre URL Vercel** : `https://votre-projet.vercel.app`
2. **Testez** :
   - La page se charge ? ✅
   - Vous pouvez uploader une image ? ✅
   - Vous pouvez générer une image ? ✅

---

## 🆘 Vous êtes Toujours Perdu ?

### Où êtes-vous bloqué ?

**A. "Je ne vois pas mes repositories"**
→ Voir `RESOUDRE_PROBLEME_REPOSITORY.md`

**B. "Je ne trouve pas la section Environment Variables"**
→ Faites défiler la page de configuration vers le bas, c'est en bas de la page

**C. "Je ne sais pas quelle valeur mettre"**
→ Ouvrez `VALEURS_PRODUCTION.md` et copiez les valeurs

**D. "Le déploiement échoue"**
→ Vérifiez que toutes les 11 variables sont bien configurées

**E. "Je ne comprends pas une étape"**
→ Dites-moi à quelle étape vous êtes et je vous aiderai !

---

## 📋 Checklist Rapide

- [ ] Étape 1 : Je vois mes repositories GitHub dans Vercel
- [ ] Étape 2 : J'ai cliqué sur "Import" pour mon repository
- [ ] Étape 3 : Je suis sur la page de configuration
- [ ] Étape 4 : J'ai ajouté les 11 variables d'environnement
- [ ] Étape 5 : J'ai cliqué sur "Deploy" et attendu
- [ ] Étape 6 : J'ai ajouté `NEXT_PUBLIC_SITE_URL` et configuré le webhook Stripe
- [ ] Étape 7 : Mon application fonctionne sur l'URL Vercel

---

## 💡 Astuce

**Gardez ces fichiers ouverts** pendant le déploiement :
- `VALEURS_PRODUCTION.md` → Pour copier les valeurs Supabase et Replicate
- Votre `.env.local` → Pour copier les valeurs Stripe
- Ce guide → Pour suivre les étapes

---

**Dites-moi à quelle étape vous êtes et je vous aiderai à continuer !** 🚀

