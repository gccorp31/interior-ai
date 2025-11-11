/**
 * Script pour configurer les politiques RLS (Row Level Security) sur Supabase
 * Ce script configure les politiques pour les tables: user_profiles, generations, etc.
 * Usage: node scripts/setup-supabase-policies.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { readFileSync } from 'fs';

// Charger les variables d'environnement
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Lire le script SQL
const sqlPath = resolve(process.cwd(), 'scripts', 'add-user-profiles-update-policy.sql');
let sqlScript = '';

if (existsSync(sqlPath)) {
  sqlScript = readFileSync(sqlPath, 'utf-8');
} else {
  console.error(`❌ Script SQL non trouvé: ${sqlPath}`);
  process.exit(1);
}

async function setupPolicies() {
  try {
    console.log('🚀 Configuration des politiques RLS sur Supabase...\n');

    // Exécuter le script SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlScript });

    if (error) {
      // Si la fonction exec_sql n'existe pas, afficher le script SQL à exécuter manuellement
      if (error.message.includes('function exec_sql') || error.code === '42883') {
        console.log('⚠️  La fonction exec_sql n\'existe pas.');
        console.log('📝 Veuillez exécuter le script SQL manuellement dans le SQL Editor de Supabase:\n');
        console.log(sqlScript);
        console.log('\n✨ Script SQL affiché ci-dessus. Copiez-le et exécutez-le dans le SQL Editor de Supabase.');
      } else {
        console.error('❌ Erreur lors de l\'exécution du script SQL:', error);
        process.exit(1);
      }
    } else {
      console.log('✅ Politiques RLS configurées avec succès!');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

setupPolicies();


