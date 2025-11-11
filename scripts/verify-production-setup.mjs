#!/usr/bin/env node

/**
 * Script de vérification de la configuration de production
 * Vérifie que toutes les variables d'environnement sont configurées
 */

import 'dotenv/config';

const requiredEnvVars = {
  // Supabase
  'NEXT_PUBLIC_SUPABASE_URL': 'URL de votre projet Supabase',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Clé anonyme Supabase',
  'SUPABASE_SERVICE_ROLE_KEY': 'Clé service role Supabase (SECRÈTE)',
  
  // Stripe
  'STRIPE_SECRET_KEY': 'Clé secrète Stripe (sk_live_... en production)',
  'STRIPE_WEBHOOK_SECRET': 'Secret du webhook Stripe',
  'STRIPE_PRICE_10_EUR': 'Price ID pour le pack 50 crédits (10 EUR)',
  'STRIPE_PRICE_29_EUR': 'Price ID pour le pack 200 crédits (29 EUR)',
  
  // Replicate
  'REPLICATE_API_TOKEN': 'Token API Replicate',
  'REPLICATE_MODEL_VERSION': 'Version du modèle Replicate',
  
  // Next.js
  'NEXT_PUBLIC_SITE_URL': 'URL du site (https://votre-domaine.com)',
};

const optionalEnvVars = {
  'STRIPE_ESSENTIAL_MONTHLY_PRICE_ID': 'Price ID pour abonnement Essentiel Mensuel (optionnel)',
  'STRIPE_ESSENTIAL_YEARLY_PRICE_ID': 'Price ID pour abonnement Essentiel Annuel (optionnel)',
  'STRIPE_PRO_MONTHLY_PRICE_ID': 'Price ID pour abonnement Pro Mensuel (optionnel)',
  'STRIPE_PRO_YEARLY_PRICE_ID': 'Price ID pour abonnement Pro Annuel (optionnel)',
  'REPLICATE_INPAINTING_MODEL_VERSION': 'Version du modèle Inpainting (optionnel)',
  'REPLICATE_MOCK_MODE': 'Mode mock Replicate (doit être "false" en production)',
};

console.log('🔍 Vérification de la configuration de production...\n');

let hasErrors = false;
let hasWarnings = false;

// Vérifier les variables requises
console.log('📋 Variables requises:');
for (const [varName, description] of Object.entries(requiredEnvVars)) {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`  ❌ ${varName}: MANQUANT - ${description}`);
    hasErrors = true;
  } else {
    // Masquer les valeurs sensibles
    const displayValue = varName.includes('KEY') || varName.includes('SECRET') || varName.includes('TOKEN')
      ? `${value.substring(0, 10)}...`
      : value;
    console.log(`  ✅ ${varName}: ${displayValue}`);
    
    // Vérifications spécifiques
    if (varName === 'STRIPE_SECRET_KEY' && !value.startsWith('sk_live_')) {
      console.log(`     ⚠️  ATTENTION: Utilisez la clé LIVE (sk_live_...) en production, pas la clé de test (sk_test_...)`);
      hasWarnings = true;
    }
    
    if (varName === 'NEXT_PUBLIC_SITE_URL' && value.includes('localhost')) {
      console.log(`     ⚠️  ATTENTION: Utilisez l'URL de production (https://votre-domaine.com), pas localhost`);
      hasWarnings = true;
    }
  }
}

// Vérifier les variables optionnelles
console.log('\n📋 Variables optionnelles:');
for (const [varName, description] of Object.entries(optionalEnvVars)) {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`  ⚪ ${varName}: Non configurée - ${description}`);
  } else {
    const displayValue = varName.includes('KEY') || varName.includes('SECRET') || varName.includes('TOKEN')
      ? `${value.substring(0, 10)}...`
      : value;
    console.log(`  ✅ ${varName}: ${displayValue}`);
    
    // Vérification spéciale pour REPLICATE_MOCK_MODE
    if (varName === 'REPLICATE_MOCK_MODE' && value.toLowerCase() !== 'false') {
      console.log(`     ⚠️  ATTENTION: REPLICATE_MOCK_MODE doit être "false" en production`);
      hasWarnings = true;
    }
  }
}

// Vérifier NODE_ENV
console.log('\n📋 Environnement:');
const nodeEnv = process.env.NODE_ENV || 'development';
if (nodeEnv !== 'production') {
  console.log(`  ⚠️  NODE_ENV: ${nodeEnv} (devrait être "production" en production)`);
  hasWarnings = true;
} else {
  console.log(`  ✅ NODE_ENV: ${nodeEnv}`);
}

// Résumé
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ ERREURS TROUVÉES: Certaines variables requises sont manquantes.');
  console.log('   Veuillez configurer toutes les variables requises avant le déploiement.');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  AVERTISSEMENTS: Certaines configurations peuvent nécessiter votre attention.');
  console.log('   Vérifiez les messages ci-dessus.');
  process.exit(0);
} else {
  console.log('✅ Configuration valide! Toutes les variables requises sont configurées.');
  console.log('   Vous pouvez procéder au déploiement.');
  process.exit(0);
}




