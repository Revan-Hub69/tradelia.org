export function FinanzaPersonaleHeader() {
  return (
    <header className="border-b border-slate-800/60 bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 pb-10 pt-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800/80 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
              Tradelia
            </div>
            <span className="rounded-full border border-slate-800/80 bg-slate-900/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              Standalone
            </span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">Finanza personale</h1>
            <p className="max-w-3xl text-base text-slate-300 sm:text-lg">
              Percorso dedicato per conti, carte e banche con criteri trasparenti. Nessun collegamento con le altre
              sezioni del sito: qui trovi solo contesto operativo e compatibilità reale.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-300">
            <span className="rounded-full border border-slate-800/70 bg-slate-900/70 px-3 py-1 uppercase tracking-[0.18em]">
              Zero tracking
            </span>
            <span className="rounded-full border border-slate-800/70 bg-slate-900/70 px-3 py-1 uppercase tracking-[0.18em]">
              Fonti verificabili
            </span>
            <span className="rounded-full border border-slate-800/70 bg-slate-900/70 px-3 py-1 uppercase tracking-[0.18em]">
              Focus operativo
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
