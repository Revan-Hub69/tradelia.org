export default function WhatNotSection() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Cosa NON Facciamo</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-xl font-semibold mb-4 text-red-600">❌ Consigli di Investimento</h3>
            <p className="text-slate-600">Non forniamo consulenza finanziaria o raccomandazioni di investimento</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-xl font-semibold mb-4 text-red-600">❌ Classifiche "Migliori"</h3>
            <p className="text-slate-600">Non creiamo ranking generici o proclamiamo "il broker migliore"</p>
          </div>
        </div>
      </div>
    </section>
  );
}