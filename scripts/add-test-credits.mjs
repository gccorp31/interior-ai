/**
 * Script pour ajouter des crédits de test à un utilisateur
 * Usage: node scripts/add-test-credits.mjs <user_email> <credits>
 */

import { createClient } from '@supabase/supabase-js';
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

async function addTestCredits(userEmail, credits) {
  try {
    // Trouver l'utilisateur par email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', userError);
      process.exit(1);
    }

    const user = users.users.find(u => u.email === userEmail);
    
    if (!user) {
      console.error(`❌ Utilisateur non trouvé: ${userEmail}`);
      process.exit(1);
    }

    console.log(`✅ Utilisateur trouvé: ${user.email} (${user.id})`);

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credit_balance')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Erreur lors de la récupération du profil:', profileError);
      process.exit(1);
    }

    const currentCredits = profile?.credit_balance || 0;
    const newCredits = currentCredits + parseInt(credits);

    // Mettre à jour ou créer le profil
    const { error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        credit_balance: newCredits,
      }, {
        onConflict: 'id'
      });

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour des crédits:', updateError);
      process.exit(1);
    }

    console.log(`✅ Crédits ajoutés avec succès!`);
    console.log(`   Avant: ${currentCredits}`);
    console.log(`   Ajouté: ${credits}`);
    console.log(`   Après: ${newCredits}`);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Récupérer les arguments de la ligne de commande
const [, , userEmail, credits] = process.argv;

if (!userEmail || !credits) {
  console.error('Usage: node scripts/add-test-credits.mjs <user_email> <credits>');
  process.exit(1);
}

addTestCredits(userEmail, credits);


