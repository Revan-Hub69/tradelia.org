import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Trasparenza | Tradelia',
  description:
    'Criteri di indipendenza di Tradelia: nessuna vendita di prodotti o segnali, affiliazioni dichiarate e criteri verificabili.'
}

export default function TrasparenzaPage() {
  return (
    <main id="contenuto-principale" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Trasparenza</p>
      <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Trasparenza & confini</h1>
      <p className="mt-4 text-lg text-slate-300">
        Tradelia non vende prodotti finanziari e non pubblica segnali. Se esistono affiliazioni, sono dichiarate e non
        influenzano i criteri. Le fonti sono ufficiali e le note metodologiche sono disponibili per verificare ogni
        passaggio.
      </p>
      <p className="mt-3 text-lg text-slate-300">
        Non esistono ranking o "top list": le valutazioni sono orientate a compatibilità, attrito operativo e limiti
        espliciti. Nessuna promessa di rendimento o approvazione, solo contesto verificabile.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/metodo"
          className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Metodo
        </Link>
        <Link
          href="/investimenti"
          className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Investimenti
        </Link>
      </div>

      <p className="mt-6 text-sm text-slate-400">Informativo/educativo. Non è consulenza finanziaria.</p>
    </main>
  )
}
