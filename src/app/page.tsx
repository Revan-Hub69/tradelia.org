import Link from 'next/link'

const domainCards = [
  {
    title: 'Investimenti',
    description: 'Broker, exchange, wallet, piattaforme.',
    bullets: [
      'Regolamentazione e tutele reali',
      'Custodia e rischio operativo',
      'Costi espliciti e nascosti'
    ],
    href: '/investimenti',
    cta: 'Vai a Investimenti'
  },
  {
    title: 'Finanza personale',
    description: 'Conti, carte, banche, fintech.',
    bullets: [
      'Fee nel tempo e condizioni',
      'Limiti operativi e requisiti',
      'Compatibilità con il profilo'
    ],
    href: '/finanza-personale',
    cta: 'Vai a Finanza personale'
  },
  {
    title: 'Business & pagamenti',
    description: 'POS, gateway, incassi, conti business.',
    bullets: [
      'Commissioni marginali reali',
      'Chargeback / freeze risk',
      'Lock-in e compliance operativa'
    ],
    href: '/business',
    cta: 'Vai a Business'
  }
]

const metodoPillole = [
  'Fonti: documentazione ufficiale e regolatori (quando disponibili)',
  'Criteri: costi, vincoli, tutele, affidabilità operativa',
  'Output: scenari condizionati + incompatibilità + limiti espliciti',
  'Indipendenza: niente marketing camuffato da guida'
]

export default function HomePage() {
  return (
    <main id="contenuto-principale" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-[-20%] top-[-10%] h-[420px] rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute left-[-10%] top-1/3 h-[320px] w-[320px] rounded-full bg-slate-800/50 blur-[100px]" />
        <div className="absolute right-[-10%] top-1/4 h-[260px] w-[260px] rounded-full bg-sky-700/20 blur-[100px]" />
      </div>

      <section className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pt-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
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

          <div className="card-premium w-full max-w-md space-y-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Orientamento</p>
            <p className="text-lg font-semibold text-white">
              Decisioni basate su criteri verificabili, non su promesse o "classifiche".
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <p>• Fonti ufficiali e note metodologiche aperte.</p>
              <p>• Focalizzata su compatibilità, rischi operativi e costi nel tempo.</p>
              <p>• Nessun modello opaco: ogni criterio è dichiarato.</p>
            </div>
            <Link
              href="/trasparenza"
              className="inline-flex items-center text-sm font-semibold text-sky-200 underline-offset-4 transition hover:text-white hover:underline"
            >
              Vai alla trasparenza
            </Link>
          </div>
        </div>
      </section>

      <section
        id="domini"
        className="relative border-t border-slate-800/60 bg-slate-950/60 py-14 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Domini</p>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">Scegli il perimetro da analizzare</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Percorsi separati per rischi, requisiti e costi diversi. Nessuna spinta commerciale: solo contesto e
                criteri verificabili.
              </p>
            </div>
            <Link
              href="/metodo"
              className="rounded-full border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Leggi il metodo
            </Link>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
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
                    <span aria-hidden className="ml-2 text-base">
                      &gt;
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t border-slate-800/60 bg-slate-950 py-14 sm:py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="lg:max-w-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Metodo</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Metodo in pillole</h2>
            <p className="mt-3 text-sm text-slate-300">
              Approccio deterministico, verificabile e documentato. Ogni ipotesi è dichiarata e aggiornata con le fonti.
            </p>
          </div>
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            {metodoPillole.map((item) => (
              <div key={item} className="card-premium space-y-3 border-slate-800/60 bg-slate-900/70 p-6">
                <div className="h-10 w-10 rounded-full bg-sky-500/15 text-center text-lg font-semibold text-sky-100">
                  <span className="relative top-2.5">•</span>
                </div>
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t border-slate-800/60 bg-slate-950 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
            <div className="space-y-3 lg:max-w-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Trasparenza</p>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">Trasparenza & confini</h2>
              <p className="text-sm text-slate-300">
                Tradelia non vende prodotti finanziari e non pubblica segnali. Se esistono affiliazioni, sono dichiarate
                e non influenzano i criteri.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/trasparenza"
                  className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Vai a Trasparenza
                </Link>
                <Link
                  href="/metodo"
                  className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-300/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Vai al Metodo
                </Link>
              </div>
            </div>

            <div className="grid flex-1 gap-4 lg:grid-cols-2">
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
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
