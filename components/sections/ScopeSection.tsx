export function ScopeSection() {
  const categories = [
    {
      title: "Conti & Carte",
      icon: "💳",
      description: "Conti correnti, carte di debito e credito, servizi bancari digitali",
      examples: ["Commissioni nascoste", "Limiti di prelievo", "Costi all'estero"]
    },
    {
      title: "Wallet & Custodia", 
      icon: "🔐",
      description: "Portafogli digitali, servizi di custodia, cold storage",
      examples: ["Controllo chiavi private", "Costi di trasferimento", "Sicurezza multi-sig"]
    },
    {
      title: "Exchange & On/Off-Ramp",
      icon: "🔄", 
      description: "Piattaforme di scambio, servizi di conversione fiat-crypto",
      examples: ["Spread reali", "Tempi di elaborazione", "Limiti geografici"]
    },
    {
      title: "Broker & Intermediari",
      icon: "📊",
      description: "Intermediari finanziari, piattaforme di trading, servizi di investimento", 
      examples: ["Commissioni totali", "Requisiti minimi", "Protezione fondi"]
    }
  ]

  return (
    <section className="py-24 relative">
      <div className="section-divider mb-24"></div>
      
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gradient mb-6">
            Ambito di verifica
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Punti di passaggio del denaro, non strumenti di investimento.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {categories.map((category, index) => (
            <div key={index} className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <h3 className="text-2xl font-medium text-slate-200">{category.title}</h3>
              </div>
              
              <p className="text-slate-400 mb-6 leading-relaxed">
                {category.description}
              </p>
              
              <div>
                <p className="text-sm font-medium text-slate-300 mb-3">Verifichiamo:</p>
                <ul className="space-y-2">
                  {category.examples.map((example, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}