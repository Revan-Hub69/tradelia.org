export function ProblemSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-12">
          Il problema non è cosa comprare. È quando NON farlo.
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">⚡</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Regime Change</h3>
            <p className="text-slate-600">
              Il mercato cambia regime durante la giornata
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">💥</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Liquidazioni</h3>
            <p className="text-slate-600">
              La leva e le liquidazioni distruggono i non-professionisti
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">📊</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Complessità</h3>
            <p className="text-slate-600">
              I grafici non spiegano quanto è facile sbagliare oggi
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}