export function SolutionSection() {
  return (
    <section className="py-24 relative">
      <div className="section-divider mb-24"></div>
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gradient mb-6">
            Cosa fa Tradelia
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Mostra prima quello che di solito scopri solo dopo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-medium text-slate-200 mb-6">
              Cosa FA
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-green-400 text-sm">✓</span>
                </div>
                <span className="text-slate-300">Analizza documentazione ufficiale dei servizi</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-green-400 text-sm">✓</span>
                </div>
                <span className="text-slate-300">Evidenzia costi reali, limiti e vincoli</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-green-400 text-sm">✓</span>
                </div>
                <span className="text-slate-300">Verifica compatibilità con il tuo paese</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-green-400 text-sm">✓</span>
                </div>
                <span className="text-slate-300">Controlla requisiti KYC e procedure</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-medium text-slate-200 mb-6">
              Cosa NON fa
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-red-400 text-sm">×</span>
                </div>
                <span className="text-slate-400">Non classifica per popolarità</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-red-400 text-sm">×</span>
                </div>
                <span className="text-slate-400">Non spinge servizi specifici</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-red-400 text-sm">×</span>
                </div>
                <span className="text-slate-400">Non semplifica nascondendo problemi</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-red-400 text-sm">×</span>
                </div>
                <span className="text-slate-400">Non promette rendimenti</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}