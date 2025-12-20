import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Investimenti | Tradelia',
  description:
    'Analisi indipendente di broker, exchange e piattaforme con focus su regolamentazione, custodia e costi nascosti.'
}

export default function InvestimentiPage() {
  return (
    <main id="contenuto-principale" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Dominio</p>
      <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Investimenti</h1>
      <p className="mt-4 text-lg text-slate-300">
        Broker, exchange, wallet e piattaforme vengono analizzati partendo da regolamentazione, modelli di custodia e
        rischio operativo. L&apos;attenzione è su costi espliciti e nascosti, compatibilità con la strategia e tutele
        effettive.
      </p>
      <p className="mt-3 text-lg text-slate-300">
        Le fonti sono documentazione ufficiale e, quando disponibili, position paper dei regolatori. Ogni criterio è
        dichiarato e pensato per essere verificabile senza affidarsi a "top list" o promesse di rendimento.
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
