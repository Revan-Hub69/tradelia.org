import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/site/Header'
import { SiteFooter } from '@/components/site/Footer'

export const metadata: Metadata = {
  title: 'Finanza personale | Decision support per scelte finanziarie | Tradelia',
  description:
    'Decision support per conti, carte e servizi finanziari. Analisi di compatibilità basata su costi reali, limiti operativi e requisiti verificabili. Nessun ranking, solo compatibilità.'
}

export default function FinanzaPersonalePage() {
  return (
    <>
      <SiteHeader />
      <main id="contenuto-principale" className="relative">
        {/* Hero Section con pattern di sfondo */}
        <section className="relative overflow-hidden border-b border-slate-800/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
          
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100">
                    <div className="h-2 w-2 rounded-full bg-sky-400" />
                    Decision Support
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Finanza personale
                    <span className="block text-gradient">senza filtri</span>
                  </h1>
                  <p className="max-w-2xl text-xl leading-relaxed text-slate-300">
                    Molte decisioni finanziarie non falliscono perché "sbagliate". Falliscono perché vengono prese con 
                    informazioni incomplete, poco confrontabili o distorte dal modo in cui vengono presentate.
                  </p>
                </div>
                
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="#analisi"
                    className="btn-primary group relative overflow-hidden"
                  >
                    <span className="relative z-10">Avvia analisi di compatibilità</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-sky-500 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                  <Link
                    href="#metodo"
                    className="btn-secondary"
                  >
                    Come funziona il metodo
                  </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="card-premium group">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-white">Input operativo</p>
                        <p className="text-sm text-slate-400">Contesto reale, senza preferenze astratte</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-premium group">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-white">Esclusione</p>
                        <p className="text-sm text-slate-400">Eliminazione opzioni incompatibili</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-premium group">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-white">Output</p>
                        <p className="text-sm text-slate-400">Scenari compatibili o "nessuna opzione"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="card-premium space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-sky-400" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-sky-400">Principi</p>
                  </div>
                  <ul className="space-y-4 text-sm leading-relaxed text-slate-300">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                      <span>Fonti ufficiali e criteri verificabili</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                      <span>Focus su costi nel tempo e limiti operativi</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                      <span>Nessun ranking o promesse di risparmio</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                      <span>Esito "nessuna soluzione" è valido</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problema Section */}
        <section id="problema" className="border-b border-slate-800/60 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-sky-400">Perché scegliere è difficile</p>
                  <h2 className="text-3xl font-bold text-white sm:text-4xl">
                    Il problema non è la mancanza di informazioni
                  </h2>
                  <p className="text-lg leading-relaxed text-slate-300">
                    È l'eccesso di informazioni non progettate per aiutare una decisione reale. Questo non rende 
                    quei contenuti inutili, li rende insufficienti quando la scelta dipende da vincoli concreti.
                  </p>
                </div>
              </div>
              
              <div className="card-premium space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <p className="text-sm font-semibold uppercase tracking-wider text-red-400">Limiti sistemici</p>
                </div>
                <ul className="space-y-3 text-sm leading-relaxed text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400">•</span>
                    <span>Confronti astratti invece di contesti d'uso</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400">•</span>
                    <span>Classifiche "migliori" poco verificabili</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400">•</span>
                    <span>Incentivi legati alle affiliazioni</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400">•</span>
                    <span>Incompatibilità non dichiarate</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400">•</span>
                    <span>Rifiuto dell'esito "nessuna soluzione adatta"</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Cosa fa Tradelia */}
        <section id="cosa-fa" className="border-b border-slate-800/60 bg-gradient-to-br from-slate-950 to-slate-900">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="space-y-12">
              <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-sky-400">Cosa fa Tradelia</p>
                <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                  Il nostro approccio, concretamente
                </h2>
              </div>
              
              <div className="grid gap-8 md:grid-cols-3">
                <div className="card-premium group hover:-translate-y-1">
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white">Input operativo</h3>
                    <p className="text-slate-300">
                      Raccogliamo condizioni reali d'uso: residenza, frequenza, limiti critici, problemi già vissuti.
                    </p>
                    <p className="text-sm text-slate-400">
                      Nessun obiettivo finanziario, nessuna preferenza soggettiva.
                    </p>
                  </div>
                </div>
                
                <div className="card-premium group hover:-translate-y-1">
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white">Matching</h3>
                    <p className="text-slate-300">
                      Contratti ufficiali, clausole operative verificabili, costi espliciti e costi nel tempo.
                    </p>
                    <p className="text-sm text-slate-400">
                      Dati aggregati anonimi di utilizzo reale.
                    </p>
                  </div>
                </div>
                
                <div className="card-premium group hover:-translate-y-1">
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white">Esclusione</h3>
                    <p className="text-slate-300">
                      Le opzioni incompatibili vengono eliminate prima di proporre qualsiasi scenario.
                    </p>
                    <p className="text-sm text-slate-400">
                      Anche se popolari o sponsorizzate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compatibilità */}
        <section id="match" className="border-b border-slate-800/60 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-sky-400">Compatibilità</p>
                  <h2 className="text-3xl font-bold text-white sm:text-4xl">
                    Cosa significa "matchare" una soluzione
                  </h2>
                  <p className="text-lg text-slate-300">Una soluzione è considerata compatibile solo se:</p>
                </div>
                
                <ul className="space-y-4 text-slate-300">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                    <span>Il contratto non introduce vincoli critici per il tuo utilizzo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                    <span>I costi nel tempo sono coerenti con la frequenza operativa</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                    <span>I limiti (prelievi, bonifici, estero, blocchi) sono gestibili</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                    <span>I casi d'uso osservati non mostrano incompatibilità ricorrenti</span>
                  </li>
                </ul>
              </div>
              
              <div className="card-premium space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <p className="text-sm font-semibold uppercase tracking-wider text-yellow-400">Regola chiave</p>
                </div>
                <div className="space-y-4">
                  <p className="text-lg font-semibold text-white">
                    Se una di queste condizioni fallisce, l'opzione viene esclusa.
                  </p>
                  <p className="text-slate-300">
                    Anche se è popolare. Anche se è sponsorizzata.
                  </p>
                  <p className="text-sm text-slate-400">
                    L'obiettivo non è trovare "la migliore". È ridurre il rischio di scegliere qualcosa 
                    che non funzionerà nel tuo contesto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="analisi" className="border-b border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="card-premium text-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/20">
                    <svg className="h-8 w-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    Avvia un'analisi di compatibilità
                  </h2>
                  <p className="mx-auto max-w-2xl text-lg text-slate-300">
                    L'analisi richiede alcune informazioni di contesto operativo. Non raccoglie dati superflui 
                    e non produce raccomandazioni automatiche.
                  </p>
                  <p className="text-slate-400">
                    In alcuni casi può indicare che non esiste una soluzione adatta nelle condizioni attuali.
                  </p>
                </div>
                
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Link
                    href="#procedi"
                    className="btn-primary group relative overflow-hidden"
                  >
                    <span className="relative z-10">Procedi all'analisi</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-sky-500 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                  <Link
                    href="/metodo"
                    className="btn-secondary"
                  >
                    Approfondisci il metodo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trasparenza */}
        <section id="trasparenza" className="bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-sky-400">Trasparenza e indipendenza</p>
                  <h2 className="text-3xl font-bold text-white sm:text-4xl">
                    Come manteniamo l'indipendenza
                  </h2>
                  <p className="text-lg leading-relaxed text-slate-300">
                    Tradelia non vende prodotti finanziari. Eventuali affiliazioni sono dichiarate e non 
                    influenzano i criteri di analisi.
                  </p>
                  <p className="text-slate-300">
                    Le affiliazioni, quando presenti, compaiono solo a valle dell'analisi e solo se esistono 
                    opzioni compatibili.
                  </p>
                </div>
              </div>
              
              <div className="card-premium space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <p className="text-sm font-semibold uppercase tracking-wider text-green-400">Disclosure</p>
                </div>
                <div className="space-y-4">
                  <p className="text-lg font-semibold text-white">
                    L'affiliazione è una conseguenza, non un obiettivo.
                  </p>
                  <Link
                    href="/trasparenza"
                    className="link-ghost-sky inline-flex items-center gap-2"
                  >
                    <span>Trasparenza & conflitti</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="section-divider" />
        
        <section className="bg-slate-950 py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-slate-400">
              <p className="font-semibold text-white">Tradelia · Finanza Personale</p>
              <p className="mt-2">Supporto decisionale per strumenti finanziari personali.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <Link href="/metodo" className="hover-link">Metodo</Link>
                <Link href="/trasparenza" className="hover-link">Trasparenza</Link>
                <Link href="/privacy" className="hover-link">Privacy</Link>
                <Link href="/disclaimer" className="hover-link">Disclaimer</Link>
              </div>
              <p className="mt-4 text-xs">Informativo / educativo. Non è consulenza finanziaria.</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
