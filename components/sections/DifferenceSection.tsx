export function DifferenceSection() {
  return (
    <section className="py-24 relative">
      <div className="section-divider mb-24"></div>
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gradient mb-6">
            Perché è diversa
          </h2>
          <p className="text-xl text-slate-400">
            Prima vs Dopo
          </p>
        </div>

        <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/40 border border-slate-700/50 rounded-2xl p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-medium text-red-400 mb-6 flex items-center gap-2">
                <span>❌</span> Altri servizi
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <span className="text-slate-400">Ti mostrano solo i vantaggi</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <span className="text-slate-400">Classifiche basate su partnership</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <span className="text-slate-400">Problemi nascosti nei termini</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <span className="text-slate-400">Scopri i limiti dopo aver depositato</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium text-green-400 mb-6 flex items-center gap-2">
                <span>✅</span> Tradelia
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <span className="text-slate-300">Mostra prima quello che scopri dopo</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <span className="text-slate-300">Analisi indipendente e neutrale</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <span className="text-slate-300">Problemi evidenziati chiaramente</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <span className="text-slate-300">Controllo preventivo completo</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-4 bg-slate-900/50 border border-slate-800/50 rounded-xl px-6 py-4">
            <div className="text-2xl">🔍</div>
            <div className="text-left">
              <p className="text-lg font-medium text-slate-200">
                "Mostriamo prima quello che di solito scopri solo dopo"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}