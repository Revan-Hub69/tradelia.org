export function ProblemSection() {
  return (
    <section className="py-24 relative">
      <div className="section-divider mb-24"></div>
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gradient mb-6">
            Il problema non è <em className="text-accent font-medium">cosa</em> comprare.
          </h2>
          <h3 className="text-3xl font-light text-slate-400">
            È <em className="text-white font-medium">quando NON</em> farlo.
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card-premium text-center group">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 flex items-center justify-center group-hover:border-red-500/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
              </div>
            </div>
            <h3 className="text-xl font-medium text-slate-200 mb-4">Regime Change</h3>
            <p className="text-slate-400 leading-relaxed">
              Il mercato cambia regime durante la giornata senza preavviso
            </p>
          </div>

          <div className="card-premium text-center group">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 flex items-center justify-center group-hover:border-orange-500/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <div className="w-3 h-3 bg-orange-400 rounded-sm"></div>
              </div>
            </div>
            <h3 className="text-xl font-medium text-slate-200 mb-4">Liquidazioni</h3>
            <p className="text-slate-400 leading-relaxed">
              La leva distrugge i non-professionisti in condizioni di stress
            </p>
          </div>

          <div className="card-premium text-center group">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 flex items-center justify-center group-hover:border-yellow-500/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
              </div>
            </div>
            <h3 className="text-xl font-medium text-slate-200 mb-4">Complessità</h3>
            <p className="text-slate-400 leading-relaxed">
              I grafici non mostrano quanto è facile sbagliare oggi
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}