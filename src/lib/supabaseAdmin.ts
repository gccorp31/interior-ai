import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Créer le client de manière lazy (seulement quand on en a besoin)
// Cela permet à Next.js de charger les variables d'environnement avant la création du client
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  // Si le client n'existe pas encore, le créer
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("[SUPABASE ADMIN] ⚠️ Variables d'environnement manquantes:", {
        hasUrl: !!supabaseUrl,
        hasServiceRoleKey: !!supabaseServiceRoleKey,
        urlLength: supabaseUrl.length,
        serviceRoleKeyLength: supabaseServiceRoleKey.length
      });
      // Créer un client dummy qui retournera des erreurs mais ne crash pas
      _supabaseAdmin = createClient("https://dummy.supabase.co", "dummy-key");
      console.warn("[SUPABASE ADMIN] ⚠️ Client admin créé avec des valeurs dummy (ne fonctionnera pas)");
    } else {
      // Créer le client avec les vraies valeurs
      _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      console.log("[SUPABASE ADMIN] ✅ Client admin créé avec succès");
      console.log("[SUPABASE ADMIN] URL:", supabaseUrl.substring(0, 30) + '...');
      console.log("[SUPABASE ADMIN] Service Role Key length:", supabaseServiceRoleKey.length);
    }
  }

  return _supabaseAdmin;
}

// Exporter une fonction qui retourne le client (lazy initialization)
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});



