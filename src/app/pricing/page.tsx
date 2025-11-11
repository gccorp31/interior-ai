"use client";

import { useState } from "react";

type Pack = {
  id: string;
  title: string;
  priceEur: number;
  credits: number;
};

const PACKS: Pack[] = [
  { id: "pack_50", title: "Pack Découverte", priceEur: 10, credits: 50 },
  { id: "pack_200", title: "Pack Pro", priceEur: 29, credits: 200 },
];

export default function PricingPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function buy(pack: Pack) {
    setLoadingId(pack.id);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: pack.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur de paiement");
      window.location.href = data.url;
    } catch (e) {
      alert((e as any)?.message || "Erreur de paiement");
    } finally {
      setLoadingId(null);
    }
  }

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
            Tarifs
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Choisissez le pack de crédits qui vous convient
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {PACKS.map((p) => (
              <div key={p.id} className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{p.title}</h2>
                <p className="mt-4 text-4xl font-bold text-zinc-900 dark:text-zinc-50">{p.priceEur} €</p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{p.credits} crédits</p>
                <button
                  onClick={() => buy(p)}
                  disabled={loadingId === p.id}
                  className="mt-6 w-full rounded-lg bg-gradient-to-r from-zinc-900 to-zinc-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-zinc-800 hover:to-zinc-600 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900 dark:hover:from-zinc-200 dark:hover:to-zinc-400"
                >
                  {loadingId === p.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Redirection...
                    </span>
                  ) : (
                    "Acheter"
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}



