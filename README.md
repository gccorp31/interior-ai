# MonDécorateurIA

Application web de décoration d'intérieurs utilisant l'IA pour transformer les pièces selon différents styles.

## 🚀 Fonctionnalités

### Utilisateurs anonymes
- 2 générations gratuites sans inscription
- Watermark sur les images générées
- Modal d'inscription après la limite atteinte

### Utilisateurs authentifiés
- Plan "Découverte" avec 5 crédits gratuits
- Générations sans watermark
- Galerie personnelle des générations
- Publication dans la galerie publique
- Gestion des crédits

### Génération d'images
- Mode Redesign (transformation complète)
- Mode Inpainting (transformation de zones spécifiques)
- Mode Virtual Staging (mise en scène virtuelle)
- Plusieurs styles disponibles (Scandinave, Industriel, Japandi, etc.)
- Plusieurs types de pièces (Salon, Chambre, Cuisine, etc.)

### Monétisation
- Packs de crédits (50 crédits pour 10€, 200 crédits pour 29€)
- Abonnements mensuels et annuels (Essentiel, Pro)
- Intégration Stripe complète

## 📁 Structure du projet

### Pages
- `/` - Page d'accueil avec génération d'images
- `/login` - Page de connexion/inscription
- `/account` - Page de gestion du compte (crédits, plan)
- `/pricing` - Page des tarifs
- `/inspiration` - Galerie publique d'inspiration
- `/success` - Page de confirmation de paiement

### Composants
- `ImageUploadDropzone` - Zone de téléchargement d'images
- `GenerationsGallery` - Galerie des générations utilisateur
- `WatermarkImage` - Composant pour afficher des images avec watermark
- `MaskCanvas` - Canvas pour dessiner des masques (inpainting)
- `AuthNav` - Navigation avec authentification
- `LayoutWrapper` - Wrapper de layout commun

### API Routes
- `/api/generate` - Génération d'images avec Replicate
- `/api/status/[prediction_id]` - Statut de la génération
- `/api/user/credits` - Récupération des crédits utilisateur
- `/api/user/generation` - Récupération des générations utilisateur
- `/api/user/stats` - Statistiques utilisateur
- `/api/publish-to-gallery` - Publication dans la galerie publique
- `/api/stripe/create-checkout-session` - Création de session Stripe (packs)
- `/api/stripe/create-portal-session` - Portail de gestion Stripe
- `/api/stripe/create-subscription` - Création d'abonnement Stripe
- `/api/webhook/replicate` - Webhook Replicate
- `/api/webhook/stripe` - Webhook Stripe

### Scripts
- `add-user-profiles-update-policy.sql` - Politiques RLS pour user_profiles
- `add-has-watermark-column.sql` - Ajout de la colonne has_watermark
- `migrate-user-profiles-subscriptions.sql` - Migration vers le modèle d'abonnement
- `migrate-to-saas-model.sql` - Migration complète vers le modèle SaaS
- `check-and-add-credits.sql` - Fonction pour ajouter des crédits
- `add-test-credits.mjs` - Script Node.js pour ajouter des crédits de test
- `create-stripe-prices.mjs` - Création des prix Stripe (packs)
- `create-stripe-subscription-prices.mjs` - Création des prix d'abonnement
- `create-stripe-saas-prices.mjs` - Création des prix SaaS complets
- `setup-supabase-policies.mjs` - Configuration des politiques RLS

### Documentation
- `SETUP_SUPABASE.md` - Guide de configuration Supabase
- `SUBSCRIPTION_SETUP.md` - Guide de configuration Stripe
- `NEXT_STEPS.md` - Prochaines étapes et fonctionnalités à implémenter
- `TO_FINALIZE.md` - Checklist de finalisation

## 🛠️ Installation

### Prérequis
- Node.js 18+
- Compte Supabase
- Compte Stripe (optionnel, pour la monétisation)
- Compte Replicate (pour la génération d'images)

### Configuration

1. Cloner le projet
```bash
git clone <repository-url>
cd mon-decorateur-ia
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
Créer un fichier `.env.local` avec:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Stripe (optionnel)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_10_EUR=price_...
STRIPE_PRICE_29_EUR=price_...

# Replicate
REPLICATE_API_TOKEN=r8_...
REPLICATE_MODEL_VERSION=stability-ai/sdxl
REPLICATE_MOCK_MODE=true  # Pour les tests

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Configurer Supabase
- Suivre le guide dans `SETUP_SUPABASE.md`
- Exécuter les scripts SQL nécessaires

5. Lancer le serveur de développement
```bash
npm run dev
```

## 🧪 Tests

### Tests E2E avec Playwright
```bash
# Lancer tous les tests
npm run test:e2e

# Lancer un test spécifique
npm run test:e2e flux-anonyme.spec.ts -- --project=chromium

# Lancer les tests en mode UI
npm run test:e2e:ui
```

### Tests disponibles
- `flux-anonyme.spec.ts` - Test du flux utilisateur anonyme
- `flux-inscription.spec.ts` - Test du flux d'inscription/connexion
- `flux-utilisateur-gratuit.spec.ts` - Test du flux utilisateur gratuit

## 📦 Déploiement

### Vercel
1. Connecter le projet à Vercel
2. Configurer les variables d'environnement
3. Déployer

### Variables d'environnement en production
Assurez-vous de configurer toutes les variables d'environnement dans Vercel, notamment:
- Les clés Supabase
- Les clés Stripe (mode production)
- Le token Replicate
- L'URL du site (pour les webhooks)

## 🏗️ Architecture

### Stack technique
- **Framework**: Next.js 16 (App Router)
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Storage**: Supabase Storage
- **Paiements**: Stripe
- **IA**: Replicate.com
- **Tests**: Playwright
- **Styling**: Tailwind CSS

### Base de données
- `user_profiles` - Profils utilisateur (crédits, plan, abonnements)
- `generations` - Générations d'images
- `credit_transactions` - Transactions de crédits (audit)

## 📝 License

MIT

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur le repository.

---

**Note**: Ce projet a été restauré après un "undo all". Tous les fichiers ont été recréés et restaurés dans leur état fonctionnel.
