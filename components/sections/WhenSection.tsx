export function WhenSection() {
  const moments = [
    {
      title: "Prima di aprire un conto",
      icon: "🏦",
      description: "Verifica costi reali, limiti di prelievo e requisiti del tuo paese"
    },
    {
      title: "Prima di collegare una carta", 
      icon: "💳",
      description: "Controlla commissioni estero, limiti giornalieri e costi nascosti"
    },
    {
      title: "Prima di usare un wallet",
      icon: "🔐", 
      description: "Analizza controllo chiavi, costi trasferimento e sicurezza"
    },
    {
      title: "Prima di scegliere un exchange",
      icon: "🔄",
      description: "Esamina spread reali, tempi elaborazione e restrizioni geografiche"
    },
    {
      title: "Prima di affidare soldi a un broker",
      icon: "📊",
      description: "Studia commissioni totali, protezione fondi e requisiti minimi"
    }
  ]

  return (
    <section className="py-24 relative">
      <div className="section-divider mb-24"></div>
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gradient mb-6">
            Quando usare Tradelia
          </h2>
          <p className="text-xl text-slate-400">
            I momenti decisionali cruciali
          </p>
        </div>

        <div className="space-y-6 mb-12">
          {moments.map((moment, index) => (
            <div key={index} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-slate-700/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">{moment.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-2">{moment.title}</h3>
                  <p className="text-slate-400">{moment.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-2xl font-medium text-slate-200 mb-4">
              Il momento giusto è PRIMA
            </h3>
            <p className="text-slate-400 mb-6">
              Non dopo aver già depositato, collegato la carta o iniziato a usare il servizio.
            </p>
            <button className="btn-primary">
              Inizia la verifica
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}