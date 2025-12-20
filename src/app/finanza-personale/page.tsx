import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Finanza personale | Tradelia',
  description:
    'Analisi indipendente di conti, carte e servizi fintech con focus su fee nel tempo, limiti operativi e requisiti.'
}

export default function FinanzaPersonalePage() {
  return (
    <main id="contenuto-principale" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Dominio</p>
      <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Finanza personale</h1>
      <p className="mt-4 text-lg text-slate-300">
        Conti, carte e banche vengono letti attraverso fee ricorrenti, condizioni operative e compatibilità con i
        requisiti dell&apos;utente. L&apos;obiettivo è chiarire cosa comporta usare un prodotto per mesi o anni, non
        solo al primo mese promozionale.
      </p>
      <p className="mt-3 text-lg text-slate-300">
        Si evidenziano limiti operativi, requisiti di compliance e possibili incompatibilità con profili specifici.
        Nessun claim di risparmio assicurato: ogni scenario è documentato e verificabile.
      </p>

      <p className="mt-6 text-sm text-slate-400">Informativo/educativo. Non è consulenza finanziaria.</p>
    </main>
  )
}
