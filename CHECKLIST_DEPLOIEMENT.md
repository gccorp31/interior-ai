# ✅ Checklist de Déploiement - MonDécorateurIA

Utilisez cette checklist pour vous assurer que tout est prêt avant le déploiement.

---

## 🔧 Préparation Locale

- [ ] **Build fonctionne** : `npm run build` passe sans erreur
- [ ] **Tests E2E passent** : `npm run test:e2e` - tous les tests au vert
- [ ] **Code poussé sur Git** : Tous les changements sont commités et poussés
- [ ] **Variables d'environnement documentées** : `.env.example` est à jour

---

## 🌐 Vercel

- [ ] **Projet Vercel créé** : Repository connecté
- [ ] **Variables d'environnement configurées** :
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `STRIPE_SECRET_KEY` (clé LIVE)
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `STRIPE_PRICE_10_EUR`
  - [ ] `STRIPE_PRICE_29_EUR`
  - [ ] `REPLICATE_API_TOKEN`
  - [ ] `REPLICATE_MODEL_VERSION`
  - [ ] `REPLICATE_INPAINTING_MODEL_VERSION`
  - [ ] `REPLICATE_MOCK_MODE=false` ⚠️ IMPORTANT
  - [ ] `NEXT_PUBLIC_SITE_URL`
  - [ ] `NODE_ENV=production`
- [ ] **Déploiement réussi** : Build passe sans erreur
- [ ] **Domaine personnalisé configuré** (optionnel)

---

## 🗄️ Supabase Production

- [ ] **Projet Supabase créé** : Projet de production configuré
- [ ] **Tables créées** :
  - [ ] `user_profiles` avec colonnes : `id`, `credit_balance`, `plan`, `created_at`, `updated_at`
  - [ ] `generations` avec toutes les colonnes nécessaires
- [ ] **RLS activé** : Row Level Security activé sur toutes les tables
- [ ] **Politiques RLS créées** :
  - [ ] `SELECT` sur `user_profiles` pour les utilisateurs authentifiés
  - [ ] `INSERT` sur `user_profiles` pour les utilisateurs authentifiés
  - [ ] `UPDATE` sur `user_profiles` pour les utilisateurs authentifiés (sur leur propre ligne)
  - [ ] `SELECT` sur `generations` pour les utilisateurs authentifiés
  - [ ] `INSERT` sur `generations` pour les utilisateurs authentifiés
  - [ ] `UPDATE` sur `generations` pour les utilisateurs authentifiés
- [ ] **Storage configuré** :
  - [ ] Bucket `uploads` créé
  - [ ] Politique d'upload publique configurée
- [ ] **URL et clés vérifiées** : Correspondent aux variables dans Vercel

---

## 💳 Stripe Production

- [ ] **Mode LIVE activé** : Passer en mode production dans Stripe Dashboard
- [ ] **Produits créés** :
  - [ ] Pack 50 crédits (10 EUR)
  - [ ] Pack 200 crédits (29 EUR)
  - [ ] (Optionnel) Abonnements Essentiel et Pro
- [ ] **Price IDs notés** : Tous les Price IDs ajoutés dans Vercel
- [ ] **Webhook configuré** :
  - [ ] URL : `https://votre-domaine.com/api/webhook/stripe`
  - [ ] Événements sélectionnés : `checkout.session.completed`, etc.
  - [ ] Signing secret copié dans Vercel
- [ ] **Clé LIVE utilisée** : `STRIPE_SECRET_KEY` contient `sk_live_...` (pas `sk_test_...`)

---

## 🎨 Replicate

- [ ] **Token API valide** : Token vérifié et fonctionnel
- [ ] **Crédits disponibles** : Vérifier le solde de crédits
- [ ] **Mode mock désactivé** : `REPLICATE_MOCK_MODE=false` dans Vercel
- [ ] **Modèles configurés** : Versions des modèles correctes

---

## ✅ Tests Post-Déploiement

### Tests Fonctionnels

- [ ] **Flux anonyme** : 2 générations gratuites fonctionnent
- [ ] **Inscription** : Création de compte fonctionne
- [ ] **Connexion** : Connexion avec email/mot de passe fonctionne
- [ ] **Génération d'image** : Génération réelle (pas mock) fonctionne
- [ ] **Décrémentation crédits** : Les crédits passent de 5 à 4 après génération
- [ ] **Achat pack crédits** : Achat Stripe fonctionne
- [ ] **Ajout crédits** : Les crédits sont ajoutés après achat
- [ ] **Galerie d'inspiration** : Page `/inspiration` accessible
- [ ] **Publication galerie** : Bouton "Partager dans la galerie" fonctionne

### Tests de Performance

- [ ] **Temps de chargement** : Pages chargent en < 3 secondes
- [ ] **Temps de génération** : Génération d'image acceptable (< 2 minutes)
- [ ] **Temps de réponse API** : APIs répondent en < 1 seconde

### Tests de Sécurité

- [ ] **Variables d'environnement** : Pas exposées côté client
- [ ] **RLS actif** : Vérifié dans Supabase
- [ ] **Webhooks sécurisés** : Signature Stripe vérifiée
- [ ] **Authentification** : Seuls les utilisateurs authentifiés peuvent générer

---

## 📝 Documentation

- [ ] **README à jour** : Instructions de déploiement documentées
- [ ] **Variables d'environnement** : `.env.example` à jour
- [ ] **Guide de déploiement** : `GUIDE_DEPLOIEMENT_VERCEL.md` consulté

---

## 🎯 Finalisation

- [ ] **Monitoring configuré** : (Optionnel) Sentry, LogRocket, etc.
- [ ] **Analytics configuré** : (Optionnel) Vercel Analytics, Google Analytics
- [ ] **Backup configuré** : (Optionnel) Backup automatique de Supabase

---

## ✅ Validation Finale

Une fois tous les éléments cochés :

- [ ] **Application accessible** : URL de production fonctionne
- [ ] **Tous les flux testés** : Aucun bug critique
- [ ] **Performance acceptable** : Temps de chargement et génération OK
- [ ] **Sécurité vérifiée** : Pas de vulnérabilités évidentes

---

**🎉 Félicitations ! Votre application est prête pour le lancement !**




