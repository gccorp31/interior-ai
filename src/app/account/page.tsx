"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

type UserProfile = {
  id: string;
  credit_balance: number;
  plan: string;
};

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;
    
    async function loadProfile() {
      try {
        // Vérifier l'utilisateur connecté
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        console.log(`[AccountPage] État de l'authentification:`, {
          hasUser: !!user,
          userId: user?.id,
          hasError: !!userError,
          errorMessage: userError?.message
        });
        
        if (!isMounted) return;
        
        if (userError) {
          console.error("Erreur lors de la récupération de l'utilisateur:", userError);
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        if (isMounted) {
          setUser(user || null);
        }
        
        if (!user) {
          console.log(`[AccountPage] Aucun utilisateur connecté`);
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        if (user && isMounted) {
          // Charger le profil utilisateur avec un petit délai pour s'assurer que les mises à jour sont propagées
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Utiliser une requête forcée (sans cache) pour obtenir les données les plus récentes
          // Ajouter un timestamp pour forcer le rafraîchissement
          const timestamp = Date.now();
          console.log(`[AccountPage] Chargement du profil pour l'utilisateur ${user.id} (timestamp: ${timestamp})`);
          const { data: profileData, error } = await supabaseClient
            .from("user_profiles")
            .select("id, credit_balance")
            .eq("id", user.id)
            .single();
          
          console.log(`[AccountPage] Résultat de la requête:`, {
            hasData: !!profileData,
            hasError: !!error,
            errorCode: error?.code,
            errorMessage: error?.message,
            creditBalance: profileData?.credit_balance
          });

          if (error) {
            console.error("Erreur lors du chargement du profil:", error);
            // Si le profil n'existe pas, NE PAS le créer ici
            // La création doit être faite par l'API /api/generate lors de la première génération
            // pour éviter d'écraser une décrémentation
            // PGRST116 = "The result contains 0 rows" (profil n'existe pas)
            if (error.code === 'PGRST116' || error.message?.includes('0 rows') || error.message?.includes('No rows')) {
              // Ne pas créer le profil ici - il sera créé par l'API lors de la première génération
              // Afficher simplement un message ou des valeurs par défaut temporaires
              console.log("Profil non trouvé - sera créé lors de la première génération");
              console.log(`[AccountPage] Détails de l'erreur:`, {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
              });
              if (isMounted) {
                // Ne pas utiliser de valeurs par défaut qui pourraient être trompeuses
                // Laisser le profil à null et afficher un message approprié
                setProfile(null);
              }
            } else {
              // Autre erreur (pas "profil non trouvé"), afficher un message d'erreur
              console.error("Erreur lors du chargement du profil (non-PGRST116):", error);
              console.error(`[AccountPage] Détails de l'erreur:`, {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
              });
              if (isMounted) {
                setProfile(null);
              }
            }
          } else if (profileData) {
            if (isMounted) {
              console.log(`[AccountPage] Profil chargé: ${profileData.id}, crédits: ${profileData.credit_balance}`);
              setProfile({
                id: profileData.id,
                credit_balance: profileData.credit_balance,
                plan: "Découverte", // Par défaut, tous les utilisateurs ont le plan Découverte
              });
            }
          } else {
            // Pas de données, ne pas créer de profil par défaut
            // Le profil sera créé par l'API lors de la première génération
            if (isMounted) {
              setProfile(null);
            }
          }
        } else {
          // Pas d'utilisateur, arrêter le chargement
          if (isMounted) {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Erreur dans loadProfile:", err);
        if (isMounted) {
          setLoading(false);
        }
      } finally {
        if (isMounted && user) {
          setLoading(false);
        }
      }
    }
    
    // Charger le profil immédiatement
    loadProfile();
    
    // Recharger le profil toutes les 1 seconde pour mettre à jour les crédits
    // (utile après une génération)
    // Note: Le setInterval continue même si l'utilisateur navigue ailleurs
    // mais isMounted empêche les mises à jour d'état sur un composant démonté
    intervalId = setInterval(() => {
      if (isMounted) {
        console.log('[AccountPage] Rechargement automatique du profil...');
        loadProfile();
      }
    }, 1000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // Seulement afficher "Non connecté" si le chargement est terminé ET que l'utilisateur n'est pas connecté
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
        <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <a href="/" className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent dark:from-zinc-100 dark:to-zinc-300">
                MonDécorateurIA
              </a>
            </div>
          </div>
        </nav>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Non connecté</h1>
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">Vous devez être connecté pour voir votre compte.</p>
            <a
              href="/login"
              className="inline-block rounded-lg bg-gradient-to-r from-zinc-900 to-zinc-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-zinc-800 hover:to-zinc-600 hover:shadow-xl dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900 dark:hover:from-zinc-200 dark:hover:to-zinc-400"
            >
              Se connecter
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Utiliser le profil chargé, ou null si le profil n'est pas encore chargé
  // NE PAS utiliser de valeurs par défaut car cela masque les vrais problèmes
  // Si le profil n'existe pas, il sera créé par l'API lors de la première génération
  const displayProfile = profile;

  // Afficher le contenu (soit pendant le chargement, soit si l'utilisateur est connecté)
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent dark:from-zinc-100 dark:to-zinc-300">
              MonDécorateurIA
            </a>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Accueil
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Mon Compte
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Gérez votre profil et vos crédits
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900 sm:p-10">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <svg className="h-8 w-8 animate-spin text-zinc-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-3 text-sm text-zinc-600 dark:text-zinc-400">Chargement des informations...</span>
              </div>
            )}

            {!loading && !displayProfile && user && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
                <p className="mb-2">Chargement du profil...</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Si vous venez de générer une image, le profil devrait apparaître dans quelques secondes.</p>
              </div>
            )}

            {displayProfile && (
              <div className="space-y-6">
                {/* Plan */}
                <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-800/50 dark:to-zinc-900/50" data-testid="plan-section">
                  <div className="mb-2 flex items-center gap-2">
                    <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      Plan
                    </h2>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Votre plan actuel: <span className="font-semibold text-zinc-900 dark:text-white" data-testid="plan-name">{displayProfile.plan}</span>
                  </p>
                </div>

                {/* Crédits */}
                <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm dark:border-zinc-800 dark:from-blue-900/20 dark:to-indigo-900/20" data-testid="credits-section">
                  <div className="mb-2 flex items-center gap-2">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      Crédits
                    </h2>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Crédits disponibles: <span className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="credit-balance">{displayProfile.credit_balance}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/"
                className="flex-1 rounded-lg bg-gradient-to-r from-zinc-900 to-zinc-700 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg transition-all hover:from-zinc-800 hover:to-zinc-600 hover:shadow-xl active:scale-95 dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900 dark:hover:from-zinc-200 dark:hover:to-zinc-400"
              >
                Retour à l'accueil
              </a>
              {user && (
                <button
                  onClick={async () => {
                    await supabaseClient.auth.signOut();
                    window.location.href = '/';
                  }}
                  className="flex-1 rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Se déconnecter
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
