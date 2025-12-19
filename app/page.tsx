export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-light text-slate-900 mb-6">
            Tradelia
          </h1>
          <p className="text-xl text-slate-600 mb-4">
            Cost & Execution Friction Analyzer
          </p>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-12">
            Analisi indipendente dei costi e delle frizioni operative nei servizi finanziari. 
            Nessun consiglio di investimento, solo trasparenza metodologica.
          </p>
          <button className="bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition-colors">
            Inizia Analisi
          </button>
        </div>
      </section>

      {/* What We Analyze */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-light text-slate-900 mb-12 text-center">
            Cosa Analizziamo
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg">
              <h3 className="text-xl font-medium mb-4">Costi di Transazione</h3>
              <p className="text-slate-600">
                Commissioni, spread, tasse di bollo e altri costi nascosti che impattano sui rendimenti.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg">
              <h3 className="text-xl font-medium mb-4">Frizioni Operative</h3>
              <p className="text-slate-600">
                Tempi di esecuzione, liquidità, slippage e inefficienze che riducono l'efficacia operativa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Don't Do */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-light text-slate-900 mb-12 text-center">
            Cosa NON Facciamo
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-red-200 p-8 rounded-lg">
              <h3 className="text-xl font-medium mb-4 text-red-600">
                Consigli di Investimento
              </h3>
              <p className="text-slate-600">
                Non forniamo consulenza finanziaria o raccomandazioni di investimento.
              </p>
            </div>
            <div className="border border-red-200 p-8 rounded-lg">
              <h3 className="text-xl font-medium mb-4 text-red-600">
                Classifiche "Migliori"
              </h3>
              <p className="text-slate-600">
                Non creiamo ranking generici o proclamiamo "il broker migliore".
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-light text-slate-900 mb-12 text-center">
            Trasparenza Metodologica
          </h2>
          <div className="bg-white p-8 rounded-lg">
            <ul className="space-y-4 text-slate-600">
              <li>• Algoritmi di calcolo open source e verificabili</li>
              <li>• Dati di mercato da fonti pubbliche e certificate</li>
              <li>• Limitazioni chiaramente indicate nei risultati</li>
              <li>• Nessun conflitto di interesse con provider analizzati</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-300">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-xl font-medium mb-4 text-white">Tradelia</h3>
          <p className="text-sm mb-4">Cost & Execution Friction Analyzer</p>
          <p className="text-xs text-slate-400">
            © 2024 Tradelia. Analisi indipendente dei costi di transazione. Non forniamo consigli di investimento.
          </p>
        </div>
      </footer>
    </main>
  );
}