/**
 * Script pour créer les prix Stripe pour le modèle SaaS complet
 * Ce script crée les produits et prix pour les abonnements mensuels et annuels
 * Usage: node scripts/create-stripe-saas-prices.mjs
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Charger les variables d'environnement
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY manquant dans .env.local');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
});

const PRODUCTS = [
  {
    name: 'MonDécorateurIA - Essentiel',
    description: 'Plan Essentiel: 100 crédits par mois',
    plans: [
      {
        name: 'Essentiel Mensuel',
        amount: 999, // 9.99 EUR
        interval: 'month',
        metadata: {
          plan: 'essential',
          credits: '100',
        },
      },
      {
        name: 'Essentiel Annuel',
        amount: 9999, // 99.99 EUR (économise ~17%)
        interval: 'year',
        metadata: {
          plan: 'essential',
          credits: '100',
        },
      },
    ],
  },
  {
    name: 'MonDécorateurIA - Pro',
    description: 'Plan Pro: Générations illimitées',
    plans: [
      {
        name: 'Pro Mensuel',
        amount: 2999, // 29.99 EUR
        interval: 'month',
        metadata: {
          plan: 'pro',
          credits: 'unlimited',
        },
      },
      {
        name: 'Pro Annuel',
        amount: 29999, // 299.99 EUR (économise ~17%)
        interval: 'year',
        metadata: {
          plan: 'pro',
          credits: 'unlimited',
        },
      },
    ],
  },
];

async function createProductsAndPrices() {
  console.log('🚀 Création des produits et prix Stripe pour le modèle SaaS...\n');

  const envVars = [];

  for (const productConfig of PRODUCTS) {
    try {
      // Créer le produit
      const product = await stripe.products.create({
        name: productConfig.name,
        description: productConfig.description,
      });

      console.log(`✅ Produit créé: ${productConfig.name}`);
      console.log(`   ID: ${product.id}\n`);

      // Créer les prix pour ce produit
      for (const planConfig of productConfig.plans) {
        try {
          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: planConfig.amount,
            currency: 'eur',
            recurring: {
              interval: planConfig.interval,
            },
            metadata: planConfig.metadata,
          });

          console.log(`   ✅ Prix créé: ${planConfig.name}`);
          console.log(`      ID: ${price.id}`);
          console.log(`      Montant: ${planConfig.amount / 100} EUR`);
          console.log(`      Récurrence: ${planConfig.interval}\n`);

          // Préparer la variable d'environnement
          const envVarName = `STRIPE_${planConfig.metadata.plan.toUpperCase()}_${planConfig.interval.toUpperCase()}_PRICE_ID`;
          envVars.push(`${envVarName}=${price.id}`);
        } catch (error) {
          console.error(`   ❌ Erreur lors de la création du prix ${planConfig.name}:`, error.message);
        }
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la création du produit ${productConfig.name}:`, error.message);
    }
  }

  console.log('\n✨ Terminé!\n');
  console.log('📝 Ajoutez ces variables à votre fichier .env.local:\n');
  envVars.forEach(envVar => {
    console.log(envVar);
  });
  console.log('');
}

createProductsAndPrices();


