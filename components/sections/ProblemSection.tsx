export function ProblemSection() {
  return (
    <section className="py-24 relative">
      <div className="section-divider mb-24"></div>
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-slate-200 mb-6">
            Il problema non è scegliere il servizio migliore.
          </h2>
          <p className="text-2xl text-gradient font-medium">
            È scegliere un servizio e scoprire dopo che non era adatto a te.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">🔒</span>
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">Fondi bloccati</h3>
            <p className="text-slate-400 text-sm">
              Limiti di prelievo o vincoli che scopri solo quando ne hai bisogno
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">💸</span>
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">Costi inattesi</h3>
            <p className="text-slate-400 text-sm">
              Commissioni nascoste che non erano chiare in fase di registrazione
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">Limiti nascosti</h3>
            <p className="text-slate-400 text-sm">
              Restrizioni per paese o tipo di operazione non evidenziate
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">🌍</span>
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">Vincoli per paese</h3>
            <p className="text-slate-400 text-sm">
              Servizi non disponibili nella tua giurisdizione
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">🎆</span>
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">Assistenza inefficace</h3>
            <p className="text-slate-400 text-sm">
              Supporto lento o inesistente quando hai problemi urgenti
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">📝</span>
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">KYC retroattivo</h3>
            <p className="text-slate-400 text-sm">
              Verifiche aggiuntive richieste dopo aver già depositato
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}