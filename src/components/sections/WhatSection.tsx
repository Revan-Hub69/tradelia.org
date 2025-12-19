export default function WhatSection() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Cosa Analizziamo</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Costi di Transazione</h3>
            <p className="text-slate-600">Commissioni, spread, tasse di bollo e altri costi nascosti</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Frizioni Operative</h3>
            <p className="text-slate-600">Tempi di esecuzione, liquidità, slippage e inefficienze</p>
          </div>
        </div>
      </div>
    </section>
  );
}