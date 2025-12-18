export function TrustSection() {
  return (
    <section className="py-24 relative">
      <div className="section-divider mb-24"></div>
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gradient mb-6">
            Fiducia & Metodo
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-xl font-medium text-slate-200 mb-4">Indipendenza</h3>
            <p className="text-slate-400 leading-relaxed">
              Nessun servizio può influenzare le nostre analisi. Verifichiamo solo documentazione ufficiale.
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">⚖️</span>
            </div>
            <h3 className="text-xl font-medium text-slate-200 mb-4">Neutralità</h3>
            <p className="text-slate-400 leading-relaxed">
              Non promuoviamo servizi specifici. Mostriamo fatti oggettivi per farti decidere in autonomia.
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-xl font-medium text-slate-200 mb-4">Trasparenza</h3>
            <p className="text-slate-400 leading-relaxed">
              Metodologia aperta. Fonti verificabili. Quando presenti, i link non influenzano l'analisi.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8">
          <h3 className="text-2xl font-medium text-slate-200 mb-6 text-center">
            Come funziona l'analisi
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">📄</span>
              </div>
              <h4 className="font-medium text-slate-200 mb-2">1. Raccolta</h4>
              <p className="text-sm text-slate-400">Documentazione ufficiale e termini di servizio</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <h4 className="font-medium text-slate-200 mb-2">2. Analisi</h4>
              <p className="text-sm text-slate-400">Analisi automatizzata di costi, limiti e vincoli</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <h4 className="font-medium text-slate-200 mb-2">3. Verifica</h4>
              <p className="text-sm text-slate-400">Controllo incrociato e validazione delle informazioni</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <h4 className="font-medium text-slate-200 mb-2">4. Report</h4>
              <p className="text-sm text-slate-400">Sintesi chiara di vantaggi, svantaggi e limitazioni</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}