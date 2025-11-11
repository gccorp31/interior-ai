export default function SuccessPage() {
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

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-12 text-center shadow-xl dark:bg-zinc-900">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-zinc-50">Paiement confirmé</h1>
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            Vos crédits seront ajoutés à votre compte dans quelques instants.
          </p>
          <a
            href="/"
            className="inline-block rounded-lg bg-gradient-to-r from-zinc-900 to-zinc-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-zinc-800 hover:to-zinc-600 hover:shadow-xl active:scale-95 dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900 dark:hover:from-zinc-200 dark:hover:to-zinc-400"
          >
            Revenir à l'accueil
          </a>
        </div>
      </main>
    </div>
  );
}



