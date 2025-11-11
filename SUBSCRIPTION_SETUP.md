# Configuration des Abonnements Stripe

Ce document décrit comment configurer les abonnements Stripe pour MonDécorateurIA.

## 1. Créer un compte Stripe

1. Aller sur [stripe.com](https://stripe.com)
2. Créer un compte
3. Récupérer les clés API dans le dashboard

## 2. Configurer les variables d'environnement

Ajouter les variables suivantes dans `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_10_EUR=price_...  # Pour les packs de crédits
STRIPE_PRICE_29_EUR=price_...
STRIPE_ESSENTIAL_MONTHLY_PRICE_ID=price_...
STRIPE_ESSENTIAL_YEARLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
```

## 3. Créer les produits et prix Stripe

### Option 1: Utiliser le script automatique

```bash
node scripts/create-stripe-subscription-prices.mjs
```

Ou pour le modèle SaaS complet:

```bash
node scripts/create-stripe-saas-prices.mjs
```

### Option 2: Créer manuellement dans le dashboard Stripe

1. Aller dans Products > Add Product
2. Créer les produits suivants:
   - **Essentiel Mensuel**: 9.99 EUR/mois, 100 crédits
   - **Essentiel Annuel**: 99.99 EUR/an, 100 crédits
   - **Pro Mensuel**: 29.99 EUR/mois, illimité
   - **Pro Annuel**: 299.99 EUR/an, illimité

3. Noter les Price IDs et les ajouter dans `.env.local`

## 4. Configurer les webhooks Stripe

1. Aller dans Developers > Webhooks
2. Ajouter un endpoint: `https://votre-domaine.com/api/webhook/stripe`
3. Sélectionner les événements:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. Récupérer le Secret du webhook et l'ajouter dans `.env.local` comme `STRIPE_WEBHOOK_SECRET`

## 5. Configurer la base de données

Exécuter les scripts de migration:

```bash
# Dans le SQL Editor de Supabase
# Exécuter: scripts/migrate-user-profiles-subscriptions.sql
# Exécuter: scripts/migrate-to-saas-model.sql
```

## 6. Tester les abonnements

1. Utiliser les cartes de test Stripe:
   - Succès: `4242 4242 4242 4242`
   - Échec: `4000 0000 0000 0002`

2. Tester le flow complet:
   - Créer un compte
   - Aller sur `/pricing`
   - Sélectionner un plan
   - Compléter le checkout
   - Vérifier que les crédits sont ajoutés

## 7. Mode production

1. Passer en mode live dans Stripe
2. Mettre à jour les clés API dans `.env.local`
3. Configurer les webhooks en production
4. Tester à nouveau le flow complet

## Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Guide des abonnements](https://stripe.com/docs/billing/subscriptions/overview)
- [Webhooks Stripe](https://stripe.com/docs/webhooks)


