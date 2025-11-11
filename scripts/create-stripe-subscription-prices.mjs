/**
 * Script pour créer les prix d'abonnement Stripe (mensuels et annuels)
 * Usage: node scripts/create-stripe-subscription-prices.mjs
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

const PRICES = [
  {
    name: 'Essentiel Mensuel',
    amount: 999, // 9.99 EUR en centimes
    currency: 'eur',
    recurring: { interval: 'month' },
    metadata: {
      plan: 'essential',
      credits: '100',
    },
  },
  {
    name: 'Essentiel Annuel',
    amount: 9999, // 99.99 EUR en centimes
    currency: 'eur',
    recurring: { interval: 'year' },
    metadata: {
      plan: 'essential',
      credits: '100',
    },
  },
  {
    name: 'Pro Mensuel',
    amount: 2999, // 29.99 EUR en centimes
    currency: 'eur',
    recurring: { interval: 'month' },
    metadata: {
      plan: 'pro',
      credits: 'unlimited',
    },
  },
  {
    name: 'Pro Annuel',
    amount: 29999, // 299.99 EUR en centimes
    currency: 'eur',
    recurring: { interval: 'year' },
    metadata: {
      plan: 'pro',
      credits: 'unlimited',
    },
  },
];

async function createPrices() {
  console.log('🚀 Création des prix d\'abonnement Stripe...\n');

  for (const priceConfig of PRICES) {
    try {
      const price = await stripe.prices.create({
        unit_amount: priceConfig.amount,
        currency: priceConfig.currency,
        recurring: priceConfig.recurring,
        product_data: {
          name: priceConfig.name,
        },
        metadata: priceConfig.metadata,
      });

      console.log(`✅ Prix créé: ${priceConfig.name}`);
      console.log(`   ID: ${price.id}`);
      console.log(`   Montant: ${priceConfig.amount / 100} ${priceConfig.currency.toUpperCase()}`);
      console.log(`   Récurrence: ${priceConfig.recurring.interval}`);
      console.log(`   Plan: ${priceConfig.metadata.plan}`);
      console.log(`   Crédits: ${priceConfig.metadata.credits}\n`);

      // Afficher la variable d'environnement à ajouter
      const envVarName = `STRIPE_${priceConfig.metadata.plan.toUpperCase()}_${priceConfig.recurring.interval.toUpperCase()}_PRICE_ID`;
      console.log(`   Ajoutez à .env.local:`);
      console.log(`   ${envVarName}=${price.id}\n`);
    } catch (error) {
      console.error(`❌ Erreur lors de la création du prix ${priceConfig.name}:`, error.message);
    }
  }

  console.log('✨ Terminé!');
}

createPrices();


