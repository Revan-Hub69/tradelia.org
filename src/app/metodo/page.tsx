import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Metodo | Tradelia',
  description:
    'Metodo deterministico e verificabile di Tradelia basato su fonti ufficiali, criteri dichiarati e scenari condizionati.'
}

export default function MetodoPage() {
  return (
    <main id="contenuto-principale" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Metodo</p>
      <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Metodo Tradelia</h1>
      <p className="mt-4 text-lg text-slate-300">
        Le analisi nascono da documentazione ufficiale dei provider e, quando disponibili, da note dei regolatori. I
        criteri includono costi espliciti e nascosti, vincoli tecnici, tutele di custodia e affidabilità operativa. Ogni
        ipotesi è dichiarata e può essere verificata senza affidarsi a ranking o claim promozionali.
      </p>
      <p className="mt-3 text-lg text-slate-300">
        L&apos;output è uno scenario condizionato: compatibilità dichiarata, incompatibilità esplicite, limiti
        operativi e rischi di lock-in. Nessuna promessa di rendimento o risparmio assicurato: la priorità è la
        trasparenza metodologica.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/trasparenza"
          className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Trasparenza
        </Link>
        <Link
          href="/investimenti"
          className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Vai a Investimenti
        </Link>
      </div>

      <p className="mt-6 text-sm text-slate-400">Informativo/educativo. Non è consulenza finanziaria.</p>
    </main>
  )
}
