export function HowItWorksSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Come funziona
          </h2>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Stream dati ufficiali</h3>
              <p className="text-slate-600">Exchange, derivati, order book in tempo reale</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Normalizzazione e metriche di fragilità</h3>
              <p className="text-slate-600">Algoritmi quantitativi per misurare il rischio operativo</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Spiegazione AI educativa</h3>
              <p className="text-slate-600">L'AI non decide. Traduce i dati in linguaggio comprensibile.</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-lg font-medium text-slate-700 bg-slate-100 inline-block px-6 py-3 rounded-lg">
            "L'AI non decide. Traduce."
          </p>
        </div>
      </div>
    </section>
  )
}