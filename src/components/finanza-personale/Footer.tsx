export function FinanzaPersonaleFooter() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Tradelia
            </div>
            <p className="text-sm text-slate-400">
              Percorso standalone dedicato alla finanza personale: analisi operative, criteri dichiarati e nessun
              tracking.
            </p>
            <p className="text-xs text-slate-500">Informativo/educativo. Nessuna consulenza finanziaria.</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Principi</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• Fonti verificabili</li>
              <li>• Nessun ranking promozionale</li>
              <li>• Compatibilità reale e costi nel tempo</li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Contatti</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a className="hover-link" href="mailto:info@tradelia.org">
                  info@tradelia.org
                </a>
              </li>
              <li>
                <a className="hover-link" href="mailto:support@tradelia.org">
                  support@tradelia.org
                </a>
              </li>
            </ul>
            <p className="text-xs text-slate-500">Risposte entro 2 giorni lavorativi.</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/60 pt-6 text-xs text-slate-500">
          <span>Tradelia Finanza personale</span>
          <span>Versione standalone</span>
        </div>
      </div>
    </footer>
  )
}
