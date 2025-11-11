# 📋 Liste à Copier-Coller pour Vercel

**Instructions** : 
1. Ouvrez `VALEURS_PRODUCTION.md` pour récupérer vos valeurs
2. Pour chaque variable ci-dessous, remplacez `[VALEUR]` par la valeur correspondante
3. Dans Vercel Dashboard > Settings > Environment Variables, ajoutez chaque variable
4. Sélectionnez **Production**, **Preview**, et **Development** pour chaque variable

---

## 🗄️ Supabase (Production)

```
NEXT_PUBLIC_SUPABASE_URL=[Votre Project URL de production Supabase]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Votre anon public key de production Supabase]
SUPABASE_SERVICE_ROLE_KEY=[Votre service_role key de production Supabase]
```

---

## 💳 Stripe (Mode TEST)

```
STRIPE_SECRET_KEY=[Votre clé secrète Stripe de TEST - sk_test_...]
STRIPE_WEBHOOK_SECRET=[Votre webhook signing secret Stripe de TEST - whsec_...]
STRIPE_PRICE_10_EUR=[Votre Price ID du Pack Découverte en mode TEST - price_...]
STRIPE_PRICE_29_EUR=[Votre Price ID du Pack Pro en mode TEST - price_...]
```

**⚠️ Note** : `STRIPE_WEBHOOK_SECRET` sera configuré APRÈS le déploiement

---

## 🎨 Replicate (Production)

```
REPLICATE_API_TOKEN=[Votre token API Replicate - r8_...]
REPLICATE_MODEL_VERSION=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea85a1cee5981f6d364
REPLICATE_INPAINTING_MODEL_VERSION=stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd234c93f82c1a6c3771d8c
REPLICATE_MOCK_MODE=false
```

---

## 🌐 Next.js

```
NEXT_PUBLIC_SITE_URL=[À remplir APRÈS le déploiement avec votre URL Vercel]
NODE_ENV=production
```

**⚠️ Note** : `NEXT_PUBLIC_SITE_URL` sera mis à jour APRÈS le premier déploiement

---

## 📝 Format pour Vercel

Dans Vercel Dashboard, pour chaque variable :

1. **Key** : Le nom de la variable (ex: `NEXT_PUBLIC_SUPABASE_URL`)
2. **Value** : La valeur (ex: `https://votre-projet.supabase.co`)
3. **Environments** : ✅ Production, ✅ Preview, ✅ Development

---

## ✅ Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` : Valeur de production Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Valeur de production Supabase
- [ ] `SUPABASE_SERVICE_ROLE_KEY` : Valeur de production Supabase
- [ ] `STRIPE_SECRET_KEY` : Valeur de TEST Stripe (`sk_test_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` : Valeur de TEST Stripe (après déploiement)
- [ ] `STRIPE_PRICE_10_EUR` : Price ID de TEST Stripe
- [ ] `STRIPE_PRICE_29_EUR` : Price ID de TEST Stripe
- [ ] `REPLICATE_API_TOKEN` : Token Replicate
- [ ] `REPLICATE_MODEL_VERSION` : Copier la valeur fixe
- [ ] `REPLICATE_INPAINTING_MODEL_VERSION` : Copier la valeur fixe
- [ ] `REPLICATE_MOCK_MODE` : `false`
- [ ] `NEXT_PUBLIC_SITE_URL` : URL Vercel (après déploiement)
- [ ] `NODE_ENV` : `production`

---

**💡 Astuce** : Ouvrez `VALEURS_PRODUCTION.md` à côté de Vercel Dashboard pour copier facilement les valeurs !

