export function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
          Analisi Quantitativa Crypto
          <span className="block text-blue-600">Basata su Ricerca Accademica</span>
        </h1>
        
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Indicatori on-chain e metriche di mercato con metodologie trasparenti 
          per analisi istituzionale delle criptovalute.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
          <p className="text-sm text-amber-800">
            <strong>Disclaimer:</strong> Questo servizio fornisce esclusivamente analisi quantitative 
            e contesto di mercato. Non costituisce consulenza finanziaria o raccomandazioni di investimento.
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
          Accedi al Dashboard
        </button>
      </div>
    </section>
  )
}