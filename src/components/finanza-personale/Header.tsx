export function FinanzaPersonaleHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-12 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-semibold">
              T
            </div>
            <div className="space-y-1">
              <p className="kicker">Tradelia</p>
              <p className="text-sm font-semibold">Finanza personale</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="pill">Standalone</span>
            <span className="pill">Zero tracking</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">
              Finanza personale senza filtri
            </h1>
            <p className="max-w-3xl text-base sm:text-lg">
              Percorso dedicato a conti, carte e banche con criteri chiari: fee nel tempo, limiti operativi, requisiti e
              compatibilità reale. Nessun collegamento con le altre sezioni del sito.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="pill">Fonti verificabili</span>
              <span className="pill">Focus operativo</span>
              <span className="pill">Nessun ranking</span>
            </div>
          </div>

          <div className="card space-y-4">
            <p className="kicker">Sintesi</p>
            <ul className="space-y-2 text-sm">
              <li>• Analisi su costi ricorrenti e condizioni operative</li>
              <li>• Evidenza di limiti, requisiti e incompatibilità</li>
              <li>• Nessun dato personale raccolto o memorizzato</li>
            </ul>
            <p className="text-xs text-muted">Percorso indipendente dal sito principale.</p>
          </div>
        </div>
      </div>
    </header>
  )
}
