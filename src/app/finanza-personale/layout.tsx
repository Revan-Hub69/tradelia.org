import type { ReactNode } from 'react'

export default function FinanzaPersonaleLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/60">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tradelia</p>
          <p className="text-xl font-semibold text-white">Finanza personale</p>
          <p className="text-sm text-slate-400">Percorso dedicato, indipendente dal resto del sito.</p>
        </div>
      </header>
      {children}
      <footer className="border-t border-slate-800/60">
        <div className="mx-auto max-w-5xl px-4 py-8 text-xs text-slate-400 sm:px-6 lg:px-8">
          Informativo/educativo. Nessuna consulenza finanziaria. Nessun tracking su questo percorso.
        </div>
      </footer>
    </section>
  )
}
