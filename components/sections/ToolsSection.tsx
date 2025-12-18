export function ToolsSection() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Strumenti
          </h2>
          <p className="text-lg text-slate-600">
            Ogni strumento risponde a una domanda reale
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Market State Dashboard</h3>
            <p className="text-slate-600 text-sm">Stato attuale del mercato in tempo reale</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Risk Score</h3>
            <p className="text-slate-600 text-sm">Probabilità di errori operativi oggi</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Regime & Volatility Monitor</h3>
            <p className="text-slate-600 text-sm">Identificazione cambi di regime</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Cost & Leverage Stress</h3>
            <p className="text-slate-600 text-sm">Costi nascosti e stress da leva</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 relative">
            <div className="absolute top-2 right-2">
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">PRO</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Historical Context</h3>
            <p className="text-slate-600 text-sm">Contesto storico comparabile</p>
          </div>
        </div>
      </div>
    </section>
  )
}