import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Disclaimer | Tradelia',
  description:
    'Avvertenze sull’uso dei contenuti Tradelia: natura informativa, assenza di consulenza finanziaria o promesse di rendimento.'
}

export default function DisclaimerPage() {
  return (
    <main id="contenuto-principale" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Policy</p>
      <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Disclaimer</h1>
      <p className="mt-4 text-lg text-slate-300">
        I contenuti di Tradelia sono informativi ed educativi. Non costituiscono consulenza finanziaria, raccomandazione
        di investimento o sollecitazione al pubblico risparmio. Le analisi non garantiscono risultati e possono essere
        soggette a limiti nelle fonti.
      </p>
      <p className="mt-3 text-lg text-slate-300">
        Ogni decisione resta responsabilità dell&apos;utente. Quando sono presenti affiliazioni o partnership, vengono
        dichiarate e non modificano i criteri di valutazione. Per maggiori dettagli consultare Metodo e Trasparenza.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/metodo"
          className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Metodo
        </Link>
        <Link
          href="/trasparenza"
          className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Trasparenza
        </Link>
      </div>

      <p className="mt-6 text-sm text-slate-400">Informativo/educativo. Non è consulenza finanziaria.</p>
    </main>
  )
}
