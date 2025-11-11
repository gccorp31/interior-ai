"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

type Generation = {
  id: string;
  original_image_url: string;
  generated_image_url: string | null;
  style_key: string | null;
  room_type_key: string | null;
  created_at: string;
  is_public?: boolean;
  published_to_gallery?: boolean;
};

export default function GenerationsGallery() {
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabaseClient.auth.getUser();
      setUserId(data.user?.id ?? null);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from("generations")
        .select("id, original_image_url, generated_image_url, style_key, room_type_key, created_at, is_public, published_to_gallery")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (!error && data) setItems(data as Generation[]);
      setLoading(false);
    }
    load();

    const interval = setInterval(load, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [userId]);

  async function handlePublishToGallery(generationId: string) {
    setPublishing((prev) => ({ ...prev, [generationId]: true }));
    try {
      const response = await fetch("/api/publish-to-gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la publication");
      }

      // Mettre à jour l'état local
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === generationId
            ? { ...item, is_public: true, published_to_gallery: true }
            : item
        )
      );
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      alert("Erreur lors de la publication dans la galerie");
    } finally {
      setPublishing((prev) => ({ ...prev, [generationId]: false }));
    }
  }

  if (!userId) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-800/50">
        <svg className="mx-auto mb-4 h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Connectez-vous pour voir vos générations.</p>
      </div>
    );
  }

  return (
    <div>
      {loading && items.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <svg className="h-8 w-8 animate-spin text-zinc-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-sm text-zinc-600 dark:text-zinc-400">Chargement de vos générations…</span>
        </div>
      )}
      {items.length === 0 && !loading && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-800/50">
          <svg className="mx-auto mb-4 h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Aucune génération pour le moment.</p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">Générez votre première image pour la voir apparaître ici !</p>
        </div>
      )}
      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => (
            <div key={g.id} className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="relative grid grid-cols-2 gap-2 p-2">
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                    src={g.original_image_url} 
                    alt="Image originale" 
                    className="h-40 w-full object-cover transition-transform group-hover:scale-105" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-xs font-medium text-white">
                    Originale
                  </div>
                </div>
                {g.generated_image_url ? (
                  <div className="relative overflow-hidden rounded-lg">
                    <img 
                      src={g.generated_image_url} 
                      alt="Image générée" 
                      className="h-40 w-full object-cover transition-transform group-hover:scale-105" 
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1 text-xs font-medium text-white">
                      Générée
                    </div>
                  </div>
                ) : (
                  <div className="flex h-40 w-full items-center justify-center rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900">
                    <div className="text-center">
                      <svg className="mx-auto mb-2 h-8 w-8 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">En cours…</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium">{g.room_type_key || 'N/A'}</span>
                  <span>·</span>
                  <span className="font-medium">{g.style_key || 'N/A'}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  {new Date(g.created_at).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {g.generated_image_url && (
                  <div className="mt-3">
                    {g.is_public || g.published_to_gallery ? (
                      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Publié dans la galerie</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePublishToGallery(g.id)}
                        disabled={publishing[g.id]}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        {publishing[g.id] ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Publication...
                          </span>
                        ) : (
                          "Partager dans la galerie"
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



