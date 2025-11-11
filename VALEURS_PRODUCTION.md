# 📝 Valeurs de Production - MonDécorateurIA

**⚠️ IMPORTANT** : Ce fichier contient des informations sensibles. Ne le commitez JAMAIS dans Git !

Utilisez ce fichier pour noter temporairement les valeurs nécessaires au déploiement.
**Supprimez ce fichier après avoir configuré toutes les variables dans Vercel.**

---

## 🗄️ Supabase

### Project URL
```
https://votre-projet.supabase.co
```
**À copier dans Vercel** : `NEXT_PUBLIC_SUPABASE_URL`

### Anon Key (Public)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**À copier dans Vercel** : `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Service Role Key (SECRÈTE)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**À copier dans Vercel** : `SUPABASE_SERVICE_ROLE_KEY`
**⚠️ NE JAMAIS partager cette clé !**

---

## 💳 Stripe (Mode LIVE)

### Secret Key (LIVE)
```
sk_live_...
```
**À copier dans Vercel** : `STRIPE_SECRET_KEY`
**⚠️ Utiliser la clé LIVE, pas la clé de test !**

### Webhook Signing Secret
```
whsec_...
```
**À copier dans Vercel** : `STRIPE_WEBHOOK_SECRET`
**⚠️ À configurer APRÈS le déploiement sur Vercel**

### Price ID - Pack Découverte (10 EUR)
```
price_...
```
**À copier dans Vercel** : `STRIPE_PRICE_10_EUR`

### Price ID - Pack Pro (29 EUR)
```
price_...
```
**À copier dans Vercel** : `STRIPE_PRICE_29_EUR`

---

## 🎨 Replicate

### API Token
```
r8_...
```
**À copier dans Vercel** : `REPLICATE_API_TOKEN`

---

## 🌐 Vercel

### URL de Production
```
https://votre-projet.vercel.app
```
**À copier dans Vercel** : `NEXT_PUBLIC_SITE_URL`
**⚠️ À mettre à jour APRÈS le premier déploiement**

---

## 📋 Checklist de Remplissage

### Étape 1 : Supabase
- [ ] Project URL noté
- [ ] Anon Key noté
- [ ] Service Role Key noté

### Étape 2 : Stripe
- [ ] Secret Key (LIVE) noté
- [ ] Price ID Pack Découverte noté
- [ ] Price ID Pack Pro noté
- [ ] Webhook Signing Secret noté (après déploiement)

### Étape 3 : Replicate
- [ ] API Token noté

### Étape 4 : Vercel
- [ ] URL de production notée (après déploiement)

---

## ⚠️ Rappel Important

1. **Ne commitez JAMAIS ce fichier dans Git** (il est déjà dans `.gitignore`)
2. **Supprimez ce fichier** après avoir configuré toutes les variables dans Vercel
3. **Les valeurs notées ici** seront utilisées dans Vercel Dashboard > Settings > Environment Variables
4. **Le guide** (`GUIDE_DEPLOIEMENT_ETAPE_PAR_ETAPE.md`) est juste une référence, ne le modifiez pas

---

## 🎯 Comment Utiliser Ce Fichier

1. **Pendant l'étape 1** (Supabase) : Notez les valeurs Supabase ici
2. **Pendant l'étape 2** (Stripe) : Notez les valeurs Stripe ici
3. **Pendant l'étape 3** (Replicate) : Notez la valeur Replicate ici
4. **Pendant l'étape 4** (Vercel) : Utilisez toutes ces valeurs pour configurer les variables d'environnement dans Vercel
5. **Après le déploiement** : Supprimez ce fichier

