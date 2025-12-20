export function FinanzaPersonaleHeader() {
  return (
    <header className="border-b border-slate-800/60 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-12 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800/70 bg-slate-900/60 text-sm font-semibold text-white">
              T
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Tradelia</p>
              <p className="text-sm font-semibold text-slate-100">Finanza personale</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="rounded-full border border-slate-800/70 bg-slate-900/70 px-3 py-1 uppercase tracking-[0.2em]">
              Standalone
            </span>
            <span className="rounded-full border border-slate-800/70 bg-slate-900/70 px-3 py-1 uppercase tracking-[0.2em]">
              Zero tracking
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              Finanza personale senza filtri
            </h1>
            <p className="max-w-3xl text-base text-slate-300 sm:text-lg">
              Percorso dedicato a conti, carte e banche con criteri chiari: fee nel tempo, limiti operativi, requisiti e
              compatibilità reale. Nessun collegamento con le altre sezioni del sito.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-300">
              <span className="rounded-full border border-slate-800/70 bg-slate-900/70 px-3 py-1 uppercase tracking-[0.18em]">
                Fonti verificabili
              </span>
              <span className="rounded-full border border-slate-800/70 bg-slate-900/70 px-3 py-1 uppercase tracking-[0.18em]">
                Focus operativo
              </span>
              <span className="rounded-full border border-slate-800/70 bg-slate-900/70 px-3 py-1 uppercase tracking-[0.18em]">
                Nessun ranking
              </span>
            </div>
          </div>

          <div className="card-premium space-y-4 border-slate-800/70 bg-slate-900/50 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sintesi</p>
            <ul className="space-y-2 text-sm text-slate-200">
              <li>• Analisi su costi ricorrenti e condizioni operative</li>
              <li>• Evidenza di limiti, requisiti e incompatibilità</li>
              <li>• Nessun dato personale raccolto o memorizzato</li>
            </ul>
            <p className="text-xs text-slate-400">Percorso indipendente dal sito principale.</p>
          </div>
        </div>
      </div>
    </header>
  )
}
