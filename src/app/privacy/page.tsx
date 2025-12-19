import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy | Tradelia',
  description:
    'Informazioni su trattamento dati di Tradelia: dati minimi, finalità informative e trasparenza sulle fonti.'
}

export default function PrivacyPage() {
  return (
    <main id="contenuto-principale" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Policy</p>
      <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Privacy</h1>
      <p className="mt-4 text-lg text-slate-300">
        Tradelia Main opera senza raccolta o memorizzazione di dati personali. Nessun account, nessuna profilazione,
        nessun pixel di tracciamento.
      </p>
      <p className="mt-3 text-lg text-slate-300">
        Usiamo solo risorse tecniche essenziali per far funzionare il sito. Non utilizziamo cookie pubblicitari, tracker
        di terze parti o sistemi di analytics invasivi. È una scelta precisa: meno dati, più fiducia.
      </p>
      <p className="mt-3 text-lg text-slate-300">
        Per richieste o chiarimenti puoi scrivere a privacy@tradelia.org oppure consultare la pagina Trasparenza.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/trasparenza"
          className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Trasparenza
        </Link>
        <Link
          href="/metodo"
          className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Metodo
        </Link>
      </div>

      <p className="mt-6 text-sm text-slate-400">Informativo/educativo. Non è consulenza finanziaria.</p>
    </main>
  )
}
