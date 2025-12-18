export function SolutionSection() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Tradelia osserva il mercato mentre si muove.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Market Risk State</h3>
            <p className="text-slate-600">
              Stato del mercato aggiornato in tempo reale (calmo / instabile / fragile)
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-orange-600 text-xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Error Risk Score</h3>
            <p className="text-slate-600">
              Quanto è facile fare errori operativi oggi
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 text-xl">💡</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Contesto & Spiegazione</h3>
            <p className="text-slate-600">
              Perché il rischio è alto o basso, in linguaggio umano
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}