import Link from 'next/link'

import { FadeIn } from '@/components/site/FadeIn'

const domainCards = [
  {
    title: 'Investimenti',
    description: 'Broker, exchange, wallet, piattaforme.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-sky-300">
        <path fill="currentColor" d="M4 5h5l2 3h9v2h-4l-2 3H4V5zm0 11h9.5l1.5-2h5v2h-3l-2 3H4v-3z" />
      </svg>
    ),
    bullets: [
      'Regolamentazione e tutele reali',
      'Custodia e rischio operativo',
      'Costi espliciti e nascosti'
    ],
    href: '/investimenti',
    cta: 'Vai a Investimenti ->'
  },
  {
    title: 'Finanza personale',
    description: 'Conti, carte, banche, fintech.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-sky-300">
        <path fill="currentColor" d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Zm6 1.5h-1v1H7v-1H6V7h1V6h2v1h1v1Zm-1 6h6v2h-6v-2Zm5-8v2h-4V6h4Z" />
      </svg>
    ),
    bullets: [
      'Fee nel tempo e condizioni',
      'Limiti operativi e requisiti',
      'Compatibilita con il profilo'
    ],
    href: '/finanza-personale',
    cta: 'Vai a Finanza personale ->'
  },
  {
    title: 'Business & pagamenti',
    description: 'POS, gateway, incassi, conti business.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-sky-300">
        <path fill="currentColor" d="M4 5h16v3H4V5Zm0 5h16v3H4v-3Zm0 5h16v4H4v-4Z" />
        <path fill="currentColor" d="M6 6h2v2H6V6Zm0 5h2v2H6v-2Zm0 5h2v2H6v-2Zm10-10h2v2h-2V6Zm0 5h2v2h-2v-2Zm0 5h2v2h-2v-2Z" />
      </svg>
    ),
    bullets: [
      'Commissioni marginali reali',
      'Chargeback / freeze risk',
      'Lock-in e compliance operativa'
    ],
    href: '/business',
    cta: 'Vai a Business ->'
  }
]

const metodoPillole = [
  'Fonti: documentazione ufficiale e regolatori (quando disponibili)',
  'Criteri: costi, vincoli, tutele, affidabilita operativa',
  'Output: scenari condizionati + incompatibilita + limiti espliciti',
  'Indipendenza: niente marketing camuffato da guida'
]

export default function HomePage() {
  return (
    <main id="contenuto-principale" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-[-20%] top-[-10%] h-[420px] rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute left-[-10%] top-1/3 h-[320px] w-[320px] rounded-full bg-slate-800/50 blur-[100px]" />
        <div className="absolute right-[-10%] top-1/4 h-[260px] w-[260px] rounded-full bg-sky-700/20 blur-[100px]" />
        <div className="animated-grid opacity-50" aria-hidden />
      </div>

      {/* HERO */}
      <section className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-14 pt-12 sm:px-6 lg:px-8 lg:pt-20 lg:pb-16">
        <FadeIn className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-6 lg:max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100 shadow-lg shadow-sky-900/30">
              Piattaforma indipendente
            </div>
            <div className="space-y-4">
              <h1 className="text-gradient text-4xl leading-tight sm:text-5xl">
                Tradelia: guida decisionale indipendente per scelte finanziarie.
              </h1>
              <p className="text-lg text-slate-300 sm:text-xl">
                Basata su fonti ufficiali e criteri auditabili per chiarire costi nascosti, vincoli tecnici e tutele
                reali. Nessun ranking "Top". Nessuna promessa di rendimento.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="#domini" className="btn-primary w-full sm:w-auto">
                Scegli il dominio
              </Link>
              <Link
                href="/metodo"
                className="btn-secondary w-full sm:w-auto"
              >
                Metodo & trasparenza
              </Link>
            </div>
            <p className="text-sm text-slate-400">Informativo/educativo. Non è consulenza finanziaria.</p>
          </div>
        </FadeIn>
      </section>

      {/* ORIENTAMENTO */}
      <section className="relative border-t border-slate-800/60 bg-slate-950 py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="card-premium space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Orientamento</p>
              <Link
                href="/trasparenza"
                className="text-sm font-semibold text-sky-200 underline-offset-4 transition hover:text-white hover:underline active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Vai alla Trasparenza
              </Link>
            </div>
            <h2 className="text-lg font-semibold text-white">
              Decisioni basate su criteri verificabili, non su promesse o "classifiche".
            </h2>
            <ul className="space-y-2 text-sm text-slate-200">
              <li>• Fonti ufficiali e note metodologiche aperte</li>
              <li>• Focalizzata su compatibilità, rischi operativi e costi nel tempo</li>
              <li>• Nessun modello opaco: ogni criterio è dichiarato</li>
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* DOMINI */}
      <section
        id="domini"
        className="relative border-t border-slate-800/60 bg-slate-950/60 py-14 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Domini</p>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">Scegli il perimetro da analizzare.</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Percorsi separati per rischi, requisiti e costi diversi. Nessuna spinta commerciale: solo contesto e
                criteri verificabili.
              </p>
            </div>
            <Link
              href="/metodo"
              className="link-ghost"
            >
              Leggi il Metodo
            </Link>
          </FadeIn>

          <FadeIn className="mt-10 grid gap-6 lg:grid-cols-3">
            {domainCards.map((card) => (
              <article key={card.title} className="card-premium flex h-full flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex rounded-full border border-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                    {card.title}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                    <p className="text-sm text-slate-300">{card.description}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-200">
                    {card.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" aria-hidden />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6">
                  <Link
                    href={card.href}
                    className="inline-flex items-center justify-between rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:border-sky-300/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    {card.cta}
                  </Link>
                </div>
              </article>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* METODO */}
      <section className="relative border-t border-slate-800/60 bg-slate-950 py-14 sm:py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8 lg:flex-row lg:items-start lg:justify-between">
          <FadeIn className="lg:max-w-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Metodo</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Metodo in pillole</h2>
            <p className="mt-3 text-sm text-slate-300">
              Approccio deterministico, verificabile e documentato. Ogni ipotesi è dichiarata e aggiornata con le fonti.
            </p>
          </FadeIn>
          <FadeIn className="grid flex-1 gap-4 sm:grid-cols-2">
            {metodoPillole.map((item) => (
              <div key={item} className="card-premium space-y-3 border-slate-800/60 bg-slate-900/70 p-6">
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* TRASPARENZA & CONFINI */}
      <section className="relative border-t border-slate-800/60 bg-slate-950 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
            <FadeIn className="space-y-3 lg:max-w-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Trasparenza</p>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">Trasparenza & confini</h2>
              <p className="text-sm text-slate-300">
                Tradelia non vende prodotti finanziari e non pubblica segnali. Se esistono affiliazioni, sono dichiarate
                e non influenzano i criteri.
              </p>
              <Link
                href="/trasparenza"
                className="link-ghost"
              >
                Vai alla Trasparenza
              </Link>
            </FadeIn>

            <FadeIn className="grid flex-1 gap-4 lg:grid-cols-2">
              <div className="card-premium space-y-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cosa facciamo</p>
                <ul className="space-y-2 text-sm text-slate-200">
                  <li>• Analisi informativa basata su documentazione ufficiale.</li>
                  <li>• Evidenza di costi, vincoli tecnici e tutele reali.</li>
                  <li>• Scenari condizionati e limiti espliciti.</li>
                </ul>
              </div>
              <div className="card-premium space-y-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cosa non facciamo</p>
                <ul className="space-y-2 text-sm text-slate-200">
                  <li>• Non vendiamo prodotti o segnali.</li>
                  <li>• Niente classifiche o "top broker".</li>
                  <li>• Nessuna promessa di rendimento.</li>
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </main>
  )
}


