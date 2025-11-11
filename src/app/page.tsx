"use client";

import ImageUploadDropzone from "@/components/ImageUploadDropzone";
import { useEffect, useRef, useState } from "react";
import { ROOM_TYPES_FR, STYLES_FR } from "@/lib/options";
import GenerationsGallery from "@/components/GenerationsGallery";
import { supabaseClient } from "@/lib/supabaseClient";
import WatermarkImage from "@/components/WatermarkImage";

const ANONYMOUS_GENERATION_LIMIT = 2;
const ANONYMOUS_GENERATION_COUNT_KEY = "anonymousGenerationCount";

export default function Home() {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [roomKey, setRoomKey] = useState<string>(ROOM_TYPES_FR[0].key);
  const [styleKey, setStyleKey] = useState<string>(STYLES_FR[0].key);
  const [isGenerating, setIsGenerating] = useState(false);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [anonymousGenerationCount, setAnonymousGenerationCount] = useState<number>(0);
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Vérifier l'état de connexion
    supabaseClient.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (!data.user) {
        // Charger le compteur depuis localStorage
        const count = parseInt(localStorage.getItem(ANONYMOUS_GENERATION_COUNT_KEY) || "0", 10);
        setAnonymousGenerationCount(count);
      }
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Réinitialiser le compteur si l'utilisateur se connecte
        localStorage.removeItem(ANONYMOUS_GENERATION_COUNT_KEY);
        setAnonymousGenerationCount(0);
      } else {
        // Charger le compteur depuis localStorage
        const count = parseInt(localStorage.getItem(ANONYMOUS_GENERATION_COUNT_KEY) || "0", 10);
        setAnonymousGenerationCount(count);
      }
    });

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      subscription.unsubscribe();
    };
  }, []);

  // Synchroniser le compteur avec localStorage
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === ANONYMOUS_GENERATION_COUNT_KEY) {
          const count = parseInt(e.newValue || "0", 10);
          setAnonymousGenerationCount(count);
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      const interval = setInterval(() => {
        const count = parseInt(localStorage.getItem(ANONYMOUS_GENERATION_COUNT_KEY) || "0", 10);
        if (count !== anonymousGenerationCount) {
          setAnonymousGenerationCount(count);
        }
      }, 500);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }
  }, [user, anonymousGenerationCount]);

  async function handleGenerate() {
    if (!uploadedUrl) return;
    
    // Vérifier si l'utilisateur est anonyme et si la limite est atteinte
    if (!user) {
      const currentCount = parseInt(localStorage.getItem(ANONYMOUS_GENERATION_COUNT_KEY) || "0", 10);
      if (currentCount >= ANONYMOUS_GENERATION_LIMIT) {
        setShowSignupModal(true);
        return;
      }
    }
    
    setIsGenerating(true);
    setGeneratedUrl(null);
    setGenError(null);
    setPredictionId(null);

    try {
      // Obtenir le compteur anonyme actuel
      const anonymousCount = !user 
        ? parseInt(localStorage.getItem(ANONYMOUS_GENERATION_COUNT_KEY) || "0", 10)
        : 0;

      let res: Response;
      let data: any;
      try {
        console.log("[FRONTEND] Appel à /api/generate...");
        res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: uploadedUrl,
            styleKey,
            roomTypeKey: roomKey,
            anonymousGenerationCount: anonymousCount,
            userId: user?.id, // Envoyer le userId si l'utilisateur est authentifié
          }),
        });
        
        console.log("[FRONTEND] Réponse reçue:", { status: res.status, ok: res.ok });
        
        // Vérifier si la réponse est valide avant de parser le JSON
        if (!res.ok) {
          try {
            data = await res.json();
          } catch (jsonError) {
            // Si le JSON ne peut pas être parsé, utiliser le texte de la réponse
            const text = await res.text();
            console.error("[FRONTEND] Erreur HTTP, réponse non-JSON:", text);
            throw new Error(`Erreur HTTP ${res.status}: ${text || res.statusText}`);
          }
          console.error("[FRONTEND] Erreur de l'API:", data);
          // Si la limite est atteinte, afficher le modal
          if (data?.error?.includes("Limite de générations gratuites") || res.status === 403) {
            setShowSignupModal(true);
          }
          throw new Error(data?.error || `Échec de la génération (${res.status})`);
        }
        
        // Parser le JSON seulement si la réponse est OK
        try {
          data = await res.json();
          console.log("[FRONTEND] Données reçues:", { predictionId: data?.predictionId, status: data?.status });
        } catch (jsonError: any) {
          console.error("[FRONTEND] Erreur lors du parsing JSON:", jsonError);
          throw new Error(`Réponse invalide de l'API: ${jsonError?.message}`);
        }
        
        if (!data?.predictionId) {
          console.error("[FRONTEND] predictionId manquant dans la réponse:", data);
          throw new Error("L'API n'a pas retourné de predictionId");
        }
        
        setPredictionId(data.predictionId);
        console.log("[FRONTEND] ✅ Prédiction créée:", data.predictionId);
      } catch (fetchError: any) {
        console.error("[FRONTEND] ❌ Erreur lors de l'appel à /api/generate:", fetchError);
        setGenError(fetchError?.message || "Erreur de génération");
        setIsGenerating(false);
        return; // Arrêter ici si l'API échoue
      }

      // Polling du statut toutes les 2s
      console.log("[FRONTEND] Démarrage du polling pour:", data.predictionId);
      let pollAttempts = 0;
      const maxPollAttempts = 60; // 60 tentatives * 2s = 120 secondes max
      
      pollRef.current = setInterval(async () => {
        pollAttempts++;
        console.log(`[FRONTEND] Polling tentative ${pollAttempts}/${maxPollAttempts} pour ${data.predictionId}`);
        
        try {
          const r = await fetch(`/api/status/${data.predictionId}`);
          console.log(`[FRONTEND] Réponse du polling:`, { status: r.status, ok: r.ok });
          
          if (!r.ok) {
            const errorText = await r.text().catch(() => r.statusText);
            console.error(`[FRONTEND] Erreur HTTP lors du polling:`, { status: r.status, error: errorText });
            // Ne pas arrêter immédiatement, continuer à poller
            if (pollAttempts >= maxPollAttempts) {
              throw new Error(`Erreur HTTP ${r.status}: ${errorText}`);
            }
            return;
          }
          
          let s: any;
          try {
            s = await r.json();
            console.log(`[FRONTEND] Statut de la prédiction:`, { status: s?.status, hasOutput: !!s?.output, hasError: !!s?.error });
          } catch (jsonError: any) {
            console.error("[FRONTEND] Erreur lors du parsing JSON du polling:", jsonError);
            if (pollAttempts >= maxPollAttempts) {
              throw new Error(`Réponse invalide du polling: ${jsonError?.message}`);
            }
            return;
          }
          
          if (s.status === "succeeded") {
            const out = Array.isArray(s.output) ? s.output[0] : s.output;
            console.log("[FRONTEND] ✅ Génération réussie, output:", out);
            setGeneratedUrl(out || null);
            setIsGenerating(false);
            if (pollRef.current) clearInterval(pollRef.current);
            
            // Incrémenter le compteur anonyme si l'utilisateur n'est pas connecté
            if (!user) {
              const currentCount = parseInt(localStorage.getItem(ANONYMOUS_GENERATION_COUNT_KEY) || "0", 10);
              const newCount = currentCount + 1;
              localStorage.setItem(ANONYMOUS_GENERATION_COUNT_KEY, String(newCount));
              setAnonymousGenerationCount(newCount);
              
              // Si la limite est atteinte, afficher le modal
              if (newCount >= ANONYMOUS_GENERATION_LIMIT) {
                setTimeout(() => setShowSignupModal(true), 100);
              }
            }
            return;
          }
          
          if (s.status === "failed" || s.error) {
            console.error("[FRONTEND] ❌ Génération échouée:", s.error);
            setGenError(s.error || "La génération a échoué");
            setIsGenerating(false);
            if (pollRef.current) clearInterval(pollRef.current);
            return;
          }
          
          // Si on a atteint le maximum de tentatives, arrêter le polling
          if (pollAttempts >= maxPollAttempts) {
            console.error("[FRONTEND] ❌ Timeout du polling après", maxPollAttempts, "tentatives");
            setGenError("La génération prend trop de temps. Veuillez réessayer.");
            setIsGenerating(false);
            if (pollRef.current) clearInterval(pollRef.current);
            return;
          }
        } catch (e: any) {
          console.error("[FRONTEND] ❌ Erreur lors du polling:", e);
          // Arrêter seulement si on a trop d'erreurs
          if (pollAttempts >= maxPollAttempts) {
            setGenError(e?.message || "Erreur de polling");
            setIsGenerating(false);
            if (pollRef.current) clearInterval(pollRef.current);
          }
        }
      }, 2000);
    } catch (e: any) {
      setGenError(e?.message || "Erreur de génération");
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent dark:from-zinc-100 dark:to-zinc-300">
                MonDécorateurIA
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <a
                    href="/account"
                    className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Mon Compte
                  </a>
                  <button
                    onClick={async () => {
                      await supabaseClient.auth.signOut();
                      window.location.href = '/';
                    }}
                    className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Se déconnecter
                  </button>
                </>
              ) : (
                <a
                  href="/login"
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Se connecter
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
            Transformez vos intérieurs avec l'IA
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Uploadez une photo de votre pièce et laissez notre IA la redécorer selon vos préférences de style.
          </p>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900 sm:p-10">
            <div className="grid gap-8">
              <ImageUploadDropzone onUploaded={setUploadedUrl} />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Type de pièce
                  </label>
                  <select
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm transition-colors hover:border-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-600 dark:focus:border-zinc-500"
                    value={roomKey}
                    onChange={(e) => setRoomKey(e.target.value)}
                  >
                    {ROOM_TYPES_FR.map((opt) => (
                      <option key={opt.key} value={opt.key}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Style
                  </label>
                  <select
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm transition-colors hover:border-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-600 dark:focus:border-zinc-500"
                    value={styleKey}
                    onChange={(e) => setStyleKey(e.target.value)}
                  >
                    {STYLES_FR.map((opt) => (
                      <option key={opt.key} value={opt.key}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={handleGenerate}
                disabled={!uploadedUrl || isGenerating || (!user && anonymousGenerationCount >= ANONYMOUS_GENERATION_LIMIT)}
                className={`rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all ${
                  !uploadedUrl || isGenerating || (!user && anonymousGenerationCount >= ANONYMOUS_GENERATION_LIMIT)
                    ? "cursor-not-allowed bg-zinc-400"
                    : "bg-gradient-to-r from-zinc-900 to-zinc-700 hover:from-zinc-800 hover:to-zinc-600 hover:shadow-xl active:scale-95 dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900 dark:hover:from-zinc-200 dark:hover:to-zinc-400"
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Génération en cours...
                  </span>
                ) : (
                  "Générer"
                )}
              </button>
              {predictionId && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  ID: {predictionId.substring(0, 8)}...
                </span>
              )}
            </div>

            {/* Compteur pour les utilisateurs anonymes */}
            {!user && (
              <div data-testid="anonymous-counter" className="mt-6">
                <div 
                  data-testid="anonymous-counter-text" 
                  className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 text-sm font-medium text-blue-700 shadow-sm dark:border-blue-900/50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-300"
                  role="status"
                  aria-live="polite"
                >
                  ✨ Il vous reste {ANONYMOUS_GENERATION_LIMIT - anonymousGenerationCount} génération{ANONYMOUS_GENERATION_LIMIT - anonymousGenerationCount > 1 ? 's' : ''} d'essai gratuite{ANONYMOUS_GENERATION_LIMIT - anonymousGenerationCount > 1 ? 's' : ''}
                </div>
              </div>
            )}

            {/* Modal d'inscription */}
            {showSignupModal && (
              <div 
                data-testid="signup-modal"
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={() => setShowSignupModal(false)}
              >
                <div 
                  className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-zinc-900"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
                      <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h2 id="signup-modal-title" className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
                      Créez un compte pour continuer
                    </h2>
                    <p data-testid="signup-modal-text" className="text-sm text-zinc-600 dark:text-zinc-400">
                      Vous avez utilisé vos {ANONYMOUS_GENERATION_LIMIT} générations gratuites. Créez un compte gratuitement pour continuer à transformer vos intérieurs !
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setShowSignupModal(false);
                        window.location.href = '/login';
                      }}
                      className="rounded-lg bg-gradient-to-r from-zinc-900 to-zinc-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-zinc-800 hover:to-zinc-600 hover:shadow-xl active:scale-95 dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900 dark:hover:from-zinc-200 dark:hover:to-zinc-400"
                    >
                      Créer un compte gratuitement
                    </button>
                    <button
                      onClick={() => setShowSignupModal(false)}
                      className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Plus tard
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Résultats */}
            {uploadedUrl && (
              <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-800/50">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Résultat de la génération</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium">{ROOM_TYPES_FR.find(r => r.key === roomKey)?.label}</span>
                    <span>·</span>
                    <span className="font-medium">{STYLES_FR.find(s => s.key === styleKey)?.label}</span>
                  </div>
                </div>
                
                {genError && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">❌ Erreur: {genError}</p>
                  </div>
                )}
                
                {generatedUrl && (
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-lg border border-zinc-200 shadow-lg dark:border-zinc-700">
                      <WatermarkImage 
                        src={generatedUrl} 
                        alt="Image générée" 
                        className="h-auto w-full object-cover"
                        hasWatermark={!user} // Afficher le watermark pour les utilisateurs anonymes
                      />
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <a
                        href={generatedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        Ouvrir en plein écran
                      </a>
                      <a
                        href={generatedUrl}
                        download
                        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        Télécharger
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Galerie des générations */}
        <div className="mt-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Mes générations</h2>
            <GenerationsGallery />
          </div>
        </div>
      </main>
    </div>
  );
}
