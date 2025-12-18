export function TrustSection() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Sicurezza e Trasparenza
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Dati da API ufficiali</h3>
                <p className="text-slate-600 text-sm">Stream diretti da exchange autorizzati</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Nessun ordine, nessuna esecuzione</h3>
                <p className="text-slate-600 text-sm">Solo analisi, mai accesso ai tuoi fondi</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Nessun incentivo all'over-trading</h3>
                <p className="text-slate-600 text-sm">Ti aiutiamo a NON operare quando è rischioso</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Audit, freshness, trasparenza</h3>
                <p className="text-slate-600 text-sm">Metodologie pubbliche, dati verificabili</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}