export function SolutionSection() {
  return (
    <section className="py-24 relative">
      <div className="section-divider mb-24"></div>
      
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-light text-gradient mb-6">
            Tradelia osserva il mercato
          </h2>
          <h3 className="text-3xl font-light text-slate-400">
            mentre <em className="text-accent font-medium">si muove</em>
          </h3>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="card-premium group">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 rounded-lg bg-blue-500/30 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium text-slate-200 mb-2">Market Risk State</h3>
                <div className="text-sm text-slate-500 font-mono">REAL-TIME</div>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Stato del mercato aggiornato continuamente: calmo, instabile, fragile
            </p>
          </div>

          <div className="card-premium group">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 rounded-lg bg-amber-500/30 flex items-center justify-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium text-slate-200 mb-2">Error Risk Score</h3>
                <div className="text-sm text-slate-500 font-mono">QUANTITATIVE</div>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Probabilità numerica di errori operativi nelle condizioni attuali
            </p>
          </div>

          <div className="card-premium group">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium text-slate-200 mb-2">Context Engine</h3>
                <div className="text-sm text-slate-500 font-mono">AI-POWERED</div>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Spiegazioni in linguaggio naturale del perché il rischio è alto o basso
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}