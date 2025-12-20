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
        {/* Hero compatto */}
        <section className="relative overflow-hidden border-b border-slate-800/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          
          <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-sm font-medium text-sky-100">
                <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                Decision Support
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Finanza personale
                <span className="block text-gradient mt-2">senza filtri</span>
              </h1>
              
              <p className="mx-auto max-w-2xl text-lg text-slate-300">
                Decisioni finanziarie basate su <strong>compatibilità reale</strong>, non su ranking o promesse.
              </p>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="#analisi" className="btn-primary">
                  Avvia analisi compatibilità
                </Link>
                <Link href="#come-funziona" className="btn-secondary">
                  Come funziona
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Problema - Microlearning */}
        <section id="problema" className="border-b border-slate-800/60 bg-slate-950">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Il problema non è la mancanza di informazioni
              </h2>
              <p className="text-lg text-slate-300">
                È l'eccesso di informazioni <strong>non progettate</strong> per aiutare una decisione reale.
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
                <div className="card-premium text-center p-4">
                  <div className="text-red-400 text-2xl mb-2">⚠️</div>
                  <p className="text-sm font-medium text-white">Confronti astratti</p>
                </div>
                <div className="card-premium text-center p-4">
                  <div className="text-red-400 text-2xl mb-2">📊</div>
                  <p className="text-sm font-medium text-white">Ranking non verificabili</p>
                </div>
                <div className="card-premium text-center p-4">
                  <div className="text-red-400 text-2xl mb-2">💰</div>
                  <p className="text-sm font-medium text-white">Incentivi nascosti</p>
                </div>
                <div className="card-premium text-center p-4">
                  <div className="text-red-400 text-2xl mb-2">❌</div>
                  <p className="text-sm font-medium text-white">Incompatibilità taciute</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Soluzione - Progressive Disclosure */}
        <section id="come-funziona" className="border-b border-slate-800/60 bg-gradient-to-br from-slate-950 to-slate-900">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Il nostro approccio in 3 step
              </h2>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="card-premium group hover:-translate-y-1 transition-transform">
                  <div className="text-center space-y-4 p-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                      <span className="text-xl font-bold">1</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Input operativo</h3>
                    <p className="text-sm text-slate-300">
                      Raccogliamo <strong>solo</strong> condizioni reali d'uso: residenza, frequenza, limiti critici.
                    </p>
                    <p className="text-xs text-slate-400">
                      Nessuna preferenza soggettiva
                    </p>
                  </div>
                </div>
                
                <div className="card-premium group hover:-translate-y-1 transition-transform">
                  <div className="text-center space-y-4 p-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
                      <span className="text-xl font-bold">2</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Matching</h3>
                    <p className="text-sm text-slate-300">
                      Contratti ufficiali, clausole verificabili, <strong>costi nel tempo</strong>.
                    </p>
                    <p className="text-xs text-slate-400">
                      Dati aggregati anonimi
                    </p>
                  </div>
                </div>
                
                <div className="card-premium group hover:-translate-y-1 transition-transform">
                  <div className="text-center space-y-4 p-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
                      <span className="text-xl font-bold">3</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Esclusione</h3>
                    <p className="text-sm text-slate-300">
                      Opzioni incompatibili <strong>eliminate</strong> prima di qualsiasi suggerimento.
                    </p>
                    <p className="text-xs text-slate-400">
                      Anche se popolari
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Regola chiave - Chunking */}
        <section className="border-b border-slate-800/60 bg-slate-950">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="card-premium text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/20 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">REGOLA CHIAVE</span>
              </div>
              
              <h2 className="text-xl font-bold text-white">
                Se una condizione fallisce → opzione esclusa
              </h2>
              
              <p className="text-slate-300">
                Anche se popolare. Anche se sponsorizzata.
              </p>
              
              <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                L'obiettivo non è trovare "la migliore". È <strong>ridurre il rischio</strong> di scegliere 
                qualcosa che non funzionerà nel tuo contesto.
              </p>
            </div>
          </div>
        </section>

        {/* CTA - Focused */}
        <section id="analisi" className="border-b border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="card-premium text-center space-y-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/20">
                <svg className="h-7 w-7 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-white">
                Avvia analisi di compatibilità
              </h2>
              
              <p className="text-slate-300 max-w-xl mx-auto">
                Richiede informazioni di <strong>contesto operativo</strong>. 
                Non raccoglie dati superflui.
              </p>
              
              <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-400">
                ⚠️ In alcuni casi può indicare "nessuna soluzione adatta". È un risultato valido.
              </div>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="#procedi" className="btn-primary">
                  Procedi all'analisi
                </Link>
                <Link href="/metodo" className="btn-secondary">
                  Approfondisci metodo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trasparenza - Minimal */}
        <section className="bg-slate-950">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <h2 className="text-xl font-bold text-white">
                Trasparenza e indipendenza
              </h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="card-premium p-4 text-center">
                  <div className="text-green-400 text-xl mb-2">✓</div>
                  <p className="text-sm font-medium text-white mb-1">Non vendiamo prodotti</p>
                  <p className="text-xs text-slate-400">Nessun conflitto diretto</p>
                </div>
                
                <div className="card-premium p-4 text-center">
                  <div className="text-green-400 text-xl mb-2">✓</div>
                  <p className="text-sm font-medium text-white mb-1">Affiliazioni dichiarate</p>
                  <p className="text-xs text-slate-400">Solo a valle dell'analisi</p>
                </div>
              </div>
              
              <Link href="/trasparenza" className="link-ghost-sky inline-flex items-center gap-2">
                <span>Dettagli trasparenza</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer interno */}
        <section className="border-t border-slate-800/60 bg-slate-950 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-slate-400 space-y-3">
              <p className="font-semibold text-white">Tradelia · Finanza Personale</p>
              <p>Supporto decisionale per strumenti finanziari personali</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/metodo" className="hover-link">Metodo</Link>
                <Link href="/trasparenza" className="hover-link">Trasparenza</Link>
                <Link href="/privacy" className="hover-link">Privacy</Link>
                <Link href="/disclaimer" className="hover-link">Disclaimer</Link>
              </div>
              <p className="text-xs">Informativo / educativo. Non è consulenza finanziaria.</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
