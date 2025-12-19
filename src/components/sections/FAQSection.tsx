export default function FAQSection() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Domande Frequenti</h2>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">È un servizio gratuito?</h3>
            <p className="text-slate-600">Sì, l'analisi di base è completamente gratuita e senza registrazione.</p>
          </div>
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">I miei dati sono sicuri?</h3>
            <p className="text-slate-600">Non raccogliamo dati personali. L'analisi avviene localmente nel browser.</p>
          </div>
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Quanto è accurata l'analisi?</h3>
            <p className="text-slate-600">Utilizziamo dati pubblici aggiornati, ma ogni risultato include le limitazioni metodologiche.</p>
          </div>
        </div>
      </div>
    </section>
  );
}