export default function MethodSection() {
  const steps = [
    {
      number: '01',
      title: 'Observe',
      description: 'Data ingestion + freshness',
      icon: '👁️',
      details: 'Real-time crypto market data from multiple sources with quality checks'
    },
    {
      number: '02', 
      title: 'Model',
      description: 'Regime / dominance / vol regime',
      icon: '🧮',
      details: 'Academic models: Markov switching, market microstructure, GARCH'
    },
    {
      number: '03',
      title: 'Explain', 
      description: 'Drawer + AI tutor',
      icon: '🧠',
      details: 'Contextual explanations with uncertainty quantification'
    },
    {
      number: '04',
      title: 'Limit',
      description: 'Uncertainty + no advice',
      icon: '⚠️',
      details: 'Clear limitations and confidence bounds for each metric'
    }
  ]

  return (
    <section className="py-24 relative">
      <div className="section-divider mb-24"></div>
      
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gradient mb-6">
            Metodo Tradelia
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            4-step process for evidence-based crypto analysis
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={step.number} className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center group-hover:border-blue-500/30 transition-colors">
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center">
                  <span className="text-xs font-mono text-blue-400">{step.number}</span>
                </div>
              </div>
              
              <h3 className="text-xl font-medium text-slate-200 mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm mb-3">{step.description}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{step.details}</p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-8 text-center text-slate-600">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-4 bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl px-8 py-6">
            <div className="text-4xl">🎯</div>
            <div className="text-left">
              <p className="text-lg font-medium text-slate-200 mb-1">
                No signals. No promises. Just context with uncertainty.
              </p>
              <p className="text-sm text-slate-400">
                Academic rigor meets practical application
              </p>
            </div>
          </div>
        </div>

        {/* Differenziazione */}
        <div className="mt-16 bg-gradient-to-r from-slate-900/50 to-slate-800/30 border border-slate-700/50 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-light text-slate-200 mb-3">
              Tradelia vs Others
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-medium text-red-400 mb-4">CoinGecko / CryptoQuant</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">×</span>
                  <span>Dati + dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">×</span>
                  <span>Più indicatori = più complessità</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">×</span>
                  <span>Nessuna spiegazione contestuale</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-green-400 mb-4">Tradelia</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Metodo + spiegazione contestuale + limiti</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Riduzione complessità, non "più indicatori"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>FAQ guidata con AI tutor</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}