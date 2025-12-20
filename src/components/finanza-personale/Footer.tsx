export function FinanzaPersonaleFooter() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Note</p>
            <p className="text-sm text-slate-400">
              Informativo/educativo. Nessuna consulenza finanziaria. Nessun tracciamento o memorizzazione dati su questo
              percorso.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Contatti</p>
            <p className="text-sm text-slate-400">info@tradelia.org</p>
            <p className="text-xs text-slate-500">Risposte entro 2 giorni lavorativi.</p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>Tradelia Finanza personale</span>
          <span>Versione standalone</span>
        </div>
      </div>
    </footer>
  )
}
