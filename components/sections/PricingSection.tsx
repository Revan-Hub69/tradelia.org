export function PricingSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            FREE vs PRO
          </h2>
          <p className="text-lg text-slate-600">
            "Paghi per sbagliare meno, non per guadagnare di più."
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-slate-200 rounded-lg p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">FREE</h3>
              <p className="text-slate-600">capire</p>
            </div>
            
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-slate-700">Stato del mercato</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-slate-700">Avvisi educativi</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-slate-700">Spiegazioni base</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-slate-700">Glossario rischio</span>
              </li>
            </ul>

            <button className="w-full mt-6 border border-slate-300 hover:border-slate-400 text-slate-700 py-3 rounded-lg font-medium transition-colors">
              Inizia gratis
            </button>
          </div>

          <div className="border-2 border-blue-600 rounded-lg p-8 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Raccomandato
              </span>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">PRO</h3>
              <p className="text-slate-600">ridurre errori</p>
            </div>
            
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="text-blue-600">✓</span>
                <span className="text-slate-700">Error Risk Score numerico</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-600">✓</span>
                <span className="text-slate-700">Breakdown del rischio</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-600">✓</span>
                <span className="text-slate-700">Regime detection avanzata</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-600">✓</span>
                <span className="text-slate-700">Contesto storico comparabile</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-600">✓</span>
                <span className="text-slate-700">Alert di cambio regime</span>
              </li>
            </ul>

            <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
              Upgrade a PRO
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}