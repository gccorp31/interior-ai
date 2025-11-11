import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseServer() {
  try {
    // Vérifier que les variables d'environnement sont définies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("[SUPABASE SERVER] Variables d'environnement manquantes");
      return null;
    }

    // Dans Next.js 16+, cookies() doit être appelé de manière asynchrone
    // Mais createServerClient nécessite des fonctions synchrones pour getAll() et setAll()
    // Solution: résoudre cookies() une fois, puis utiliser le cookieStore dans les closures
    const cookieStore = await cookies();
    
    // Vérifier les cookies de session Supabase
    const allCookies = cookieStore.getAll();
    const supabaseCookies = allCookies.filter(c => 
      c.name.includes('supabase') || 
      c.name.includes('sb-') || 
      c.name.includes('auth-token')
    );
    console.log("[SUPABASE SERVER] Cookies trouvés:", {
      totalCookies: allCookies.length,
      supabaseCookies: supabaseCookies.length,
      cookieNames: allCookies.map(c => c.name),
      supabaseCookieNames: supabaseCookies.map(c => c.name)
    });
    
    // Créer le client Supabase
    // Les méthodes getAll() et setAll() sont synchrones mais accèdent au cookieStore résolu
    return createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            try {
              return cookieStore.getAll();
            } catch (e: any) {
              console.error("[SUPABASE SERVER] Erreur getAll:", e?.message);
              return [];
            }
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options || {});
              });
            } catch (e: any) {
              console.error("[SUPABASE SERVER] Erreur setAll:", e?.message);
            }
          },
        },
      }
    );
  } catch (error: any) {
    console.error("[SUPABASE SERVER] Erreur initialisation:", error?.message, error?.stack);
    return null;
  }
}



