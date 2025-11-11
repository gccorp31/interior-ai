"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

type GalleryItem = {
  id: string;
  generated_image_url: string;
  original_image_url: string;
  style_key: string | null;
  room_type_key: string | null;
  created_at: string;
  user_id: string;
};

export default function InspirationPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        setLoading(true);
        // Récupérer les générations publiques
        // Note: La colonne peut être is_public, published_to_gallery, ou public
        const { data, error } = await supabaseClient
          .from("generations")
          .select("id, generated_image_url, original_image_url, style_key, room_type_key, created_at, user_id")
          .eq("is_public", true)
          .not("generated_image_url", "is", null)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          // Si is_public n'existe pas, essayer published_to_gallery
          const { data: data2, error: error2 } = await supabaseClient
            .from("generations")
            .select("id, generated_image_url, original_image_url, style_key, room_type_key, created_at, user_id")
            .eq("published_to_gallery", true)
            .not("generated_image_url", "is", null)
            .order("created_at", { ascending: false })
            .limit(50);

          if (error2) {
            console.error("Erreur lors du chargement de la galerie:", error2);
            setItems([]);
          } else {
            setItems((data2 as GalleryItem[]) || []);
          }
        } else {
          setItems((data as GalleryItem[]) || []);
        }
      } catch (err) {
        console.error("Erreur lors du chargement de la galerie:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadGallery();
  }, []);

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

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Galerie d'Inspiration
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Découvrez les transformations créées par notre communauté
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <svg className="h-8 w-8 animate-spin text-zinc-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-sm text-zinc-600 dark:text-zinc-400">Chargement de la galerie…</span>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-800/50">
            <svg className="mx-auto mb-4 h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Aucune image dans la galerie pour le moment.</p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">Soyez le premier à partager votre transformation !</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.generated_image_url}
                    alt="Transformation"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="text-xs font-medium">{item.room_type_key || 'N/A'}</p>
                      <p className="text-xs text-white/80">{item.style_key || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(item.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


