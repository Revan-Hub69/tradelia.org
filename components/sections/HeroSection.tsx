export function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
          Capisci il rischio del mercato cripto,
          <span className="block text-blue-600">prima di fare qualsiasi operazione.</span>
        </h1>
        
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Dati ufficiali in streaming + analisi contestuale.<br/>
          Nessun segnale. Nessuna promessa di profitto.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Vedi lo stato del mercato (gratis)
          </button>
          <button className="border border-slate-300 hover:border-slate-400 text-slate-700 px-8 py-3 rounded-lg font-medium transition-colors">
            Come funziona →
          </button>
        </div>

        <p className="text-sm text-slate-500">
          Educational only · High-risk market · No financial advice
        </p>
      </div>
    </section>
  )
}