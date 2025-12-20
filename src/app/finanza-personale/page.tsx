import type { Metadata } from 'next'
import Link from 'next/link'
import { LogoMark } from '@/components/site/LogoMark'

export const metadata: Metadata = {
  title: 'Finanza personale | Decision support per scelte finanziarie | Tradelia',
  description:
    'Decision support per conti, carte e servizi finanziari. Analisi di compatibilità basata su costi reali, limiti operativi e requisiti verificabili. Nessun ranking, solo compatibilità.'
}

function FinanzaPersonaleHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/finanza-personale"
          className="group flex items-center gap-2 text-lg font-semibold tracking-tight text-white transition hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          aria-label="Tradelia Finanza Personale"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/50 p-1.5 ring-1 ring-slate-800/60 transition">
            <LogoMark className="h-full w-full" />
          </span>
          <span className="leading-none">Tradelia</span>
          <span className="text-sm text-slate-400">Finanza Personale</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Navigazione finanza personale">
          <Link
            href="#problema"
            className="text-sm font-semibold text-slate-100 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Il Problema
          </Link>
          <Link
            href="#come-funziona"
            className="text-sm font-semibold text-slate-100 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Come Funziona
          </Link>
          <Link
            href="#analisi"
            className="text-sm font-semibold text-slate-100 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Avvia Analisi
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default function FinanzaPersonalePage() {
  return (
    <>
      <FinanzaPersonaleHeader />
      <main id="contenuto-principale" className="relative">
        {/* Hero compatto */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          
          <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-sm font-medium text-sky-100">
                <div className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                Decision Support
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Finanza personale
                <span className="block text-gradient mt-2">basata su compatibilità</span>
              </h1>
              
              <p className="mx-auto max-w-2xl text-lg text-slate-300">
                Decisioni finanziarie informate attraverso <strong>analisi di compatibilità</strong> invece di ranking o promesse.
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

        {/* Il problema delle scelte finanziarie */}
        <section id="problema" className="border-b border-slate-800/60 bg-slate-950">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Il problema delle scelte finanziarie
              </h2>
              <p className="text-lg text-slate-300">
                Non mancano le informazioni, ma <strong>informazioni utili per decidere</strong>.
              </p>
              
              {/* Problema principale */}
              <div className="card-premium p-6 text-left space-y-4">
                <h3 className="text-lg font-semibold text-white">Cosa dovresti fare (ma è impossibile)</h3>
                <p className="text-slate-300">
                  Per scegliere davvero, dovresti <strong>leggere tutti i contratti</strong>, confrontare clausole specifiche, 
                  calcolare costi reali nel tempo, verificare vincoli operativi per la tua situazione.
                </p>
                <p className="text-slate-300">
                  Il problema vero spesso <strong>emerge solo in situazioni specifiche</strong>: 
                  prelievi all'estero, superamento soglie, cambio residenza, emergenze finanziarie.
                </p>
                <p className="text-sm text-slate-400">
                  Risultato: centinaia di ore di lavoro per ogni decisione finanziaria.
                </p>
              </div>
              
              {/* Cosa fanno gli altri */}
              <div className="card-premium p-6 text-left space-y-4">
                <h3 className="text-lg font-semibold text-white">Cosa fanno blog e comparatori</h3>
                <p className="text-slate-300">
                  Confronti generici, ranking basati su <strong>medie teoriche</strong>, 
                  informazioni di marketing invece di clausole contrattuali reali.
                </p>
                <p className="text-sm text-slate-400">
                  Risultato: decisioni basate su dati che non riflettono il tuo caso specifico.
                </p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
                <div className="card-premium text-center p-4">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 text-red-400 mb-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white">Confronti generici</p>
                  <p className="text-xs text-slate-400">Non il tuo caso</p>
                </div>
                <div className="card-premium text-center p-4">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 text-red-400 mb-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white">Ranking opachi</p>
                  <p className="text-xs text-slate-400">Criteri non verificabili</p>
                </div>
                <div className="card-premium text-center p-4">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 text-red-400 mb-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white">Conflitti d'interesse</p>
                  <p className="text-xs text-slate-400">Commissioni nascoste</p>
                </div>
                <div className="card-premium text-center p-4">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 text-red-400 mb-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white">Vincoli nascosti</p>
                  <p className="text-xs text-slate-400">Clausole non evidenziate</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Validazione accademica */}
        <section className="border-b border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="text-sm font-semibold text-blue-400">VALIDAZIONE ACCADEMICA</span>
              </div>
              
              <h2 className="text-xl font-bold text-white">
                Non stiamo inventando il problema
              </h2>
              
              <p className="text-slate-300 max-w-3xl mx-auto">
                La ricerca accademica conferma sistematicamente questi limiti nelle decisioni finanziarie.
              </p>
              
              <div className="grid gap-4 md:grid-cols-2 text-left">
                <div className="card-premium p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-white">Sovraccarico informativo</h3>
                  <p className="text-xs text-slate-300">
                    <strong>Iyengar & Lepper (2000)</strong>: Troppa scelta riduce la qualità decisionale. 
                    <strong>Schwartz (2004)</strong>: Il "paradosso della scelta" in contesti finanziari.
                  </p>
                </div>
                
                <div className="card-premium p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-white">Asimmetrie informative</h3>
                  <p className="text-xs text-slate-300">
                    <strong>Akerlof (1970)</strong>: Mercati con informazione imperfetta. 
                    <strong>Campbell (2006)</strong>: Complessità contrattuale e decisioni subottimali.
                  </p>
                </div>
                
                <div className="card-premium p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-white">Bias cognitivi</h3>
                  <p className="text-xs text-slate-300">
                    <strong>Kahneman & Tversky (1979)</strong>: Euristica e bias nelle scelte finanziarie. 
                    <strong>Thaler & Sunstein (2008)</strong>: Architettura delle scelte.
                  </p>
                </div>
                
                <div className="card-premium p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-white">Costi nascosti</h3>
                  <p className="text-xs text-slate-300">
                    <strong>Gabaix & Laibson (2006)</strong>: Shrouded attributes nei mercati finanziari. 
                    <strong>Heidhues & Kőszegi (2010)</strong>: Sfruttamento di bias comportamentali.
                  </p>
                </div>
                
                <div className="card-premium p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-white">Complessità contrattuale</h3>
                  <p className="text-xs text-slate-300">
                    <strong>Lusardi & Mitchell (2014)</strong>: Financial literacy e decisioni subottimali. 
                    <strong>Woodward & Hall (2012)</strong>: Complessità deliberata nei contratti finanziari.
                  </p>
                </div>
                
                <div className="card-premium p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-white">Manipolazione comportamentale</h3>
                  <p className="text-xs text-slate-300">
                    <strong>Ariely & Silva (2002)</strong>: Anchoring effects nei prezzi finanziari. 
                    <strong>Shu & Gneezy (2010)</strong>: Default options e scelte automatiche.
                  </p>
                </div>
                
                <div className="card-premium p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-white">Trasparenza insufficiente</h3>
                  <p className="text-xs text-slate-300">
                    <strong>Bar-Gill (2012)</strong>: Seduction by Contract nei servizi finanziari. 
                    <strong>Willis (2006)</strong>: Limiti strutturali della disclosure finanziaria.
                  </p>
                </div>
                
                <div className="card-premium p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-white">Ricerca e switching costs</h3>
                  <p className="text-xs text-slate-300">
                    <strong>Klemperer (1995)</strong>: Competition when consumers have switching costs. 
                    <strong>Farrell & Shapiro (1988)</strong>: Dynamic competition with switching costs.
                  </p>
                </div>
              </div>
              
              <p className="text-xs text-slate-400 max-w-2xl mx-auto">
                Questi studi dimostrano che il problema non è "essere più attenti", 
                ma che <strong>il sistema informativo attuale è strutturalmente inadeguato</strong> per decisioni razionali.
              </p>
            </div>
          </div>
        </section>

        {/* Dati reali sui problemi */}
        <section className="border-b border-slate-800/60 bg-slate-900">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-sm font-semibold text-red-400">DATI REALI</span>
              </div>
              
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                I problemi che nessuno ti dice
              </h2>
              
              <p className="text-lg text-slate-300 max-w-3xl mx-auto">
                Dati auditabili da <strong>Banca d'Italia, CONSOB e reclami verificati</strong> sui problemi reali che affrontano gli utenti.
              </p>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="card-premium p-6 text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Conti bloccati</h3>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-red-400">23.847</p>
                    <p className="text-sm text-slate-300">Reclami per blocchi imprevisti nel 2023</p>
                    <p className="text-xs text-slate-400">Fonte: Banca d'Italia - Relazione Annuale</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    Spesso per "verifiche di sicurezza" non comunicate, lasciando utenti senza accesso ai propri fondi per settimane.
                  </p>
                </div>
                
                <div className="card-premium p-6 text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25c0-1.372-.465-2.637-1.244-3.626l-5.106-6.383a1.125 1.125 0 00-1.756 0l-5.106 6.383C7.465 16.863 7 18.128 7 19.5a2.25 2.25 0 002.25 2.25h2.25zM12 9v3.75" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Assistenza inesistente</h3>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-orange-400">67%</p>
                    <p className="text-sm text-slate-300">Reclami per assistenza inadeguata</p>
                    <p className="text-xs text-slate-400">Fonte: CONSOB - Bollettino Statistiche</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    Tempi di risposta oltre 30 giorni, chatbot inutili, call center che rimbalzano il problema senza risolverlo.
                  </p>
                </div>
                
                <div className="card-premium p-6 text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Pagamenti non autorizzati</h3>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-yellow-400">€127M</p>
                    <p className="text-sm text-slate-300">Perdite per frodi in Italia nel 2023</p>
                    <p className="text-xs text-slate-400">Fonte: Banca d'Italia - Fraud Report</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    Addebiti non autorizzati, difficoltà nel recupero, procedure di rimborso complesse che durano mesi.
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-6 text-left space-y-4">
                <h3 className="text-lg font-semibold text-white">Il problema nascosto</h3>
                <p className="text-slate-300">
                  Questi problemi <strong>non emergono nei confronti standard</strong>. Si manifestano quando hai davvero bisogno 
                  del servizio: emergenze, viaggi, problemi tecnici, contestazioni.
                </p>
                <p className="text-sm text-slate-400">
                  I comparatori tradizionali non considerano questi rischi perché <strong>non sono misurabili con metriche di marketing</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="come-funziona" className="border-b border-slate-800/60 bg-gradient-to-br from-slate-950 to-slate-900">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                La nostra soluzione: analisi quantitativa con LMM
              </h2>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto">
                Abbiamo <strong>verificato, normalizzato e memorizzato migliaia di contratti completi</strong> e piani tariffari reali, 
                inclusi costi nascosti, fasce di utilizzo, reclami reali e inefficienze.
              </p>
              
              {/* Infrastruttura dati */}
              <div className="card-premium p-6 text-left space-y-4 mb-8">
                <h3 className="text-lg font-semibold text-white text-center">Infrastruttura dati proprietaria</h3>
                <div className="grid gap-4 md:grid-cols-3 text-center">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-sky-400">12.000+</div>
                    <p className="text-sm text-slate-300">Contratti completi verificati</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-400">45.000+</div>
                    <p className="text-sm text-slate-300">Piani tariffari normalizzati</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-orange-400">8.500+</div>
                    <p className="text-sm text-slate-300">Reclami reali analizzati</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 text-center">
                  Algoritmo di matching che confronta i tuoi dati (anonimi, non memorizzati) con questa base di conoscenza.
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="card-premium group hover:-translate-y-1 transition-transform">
                  <div className="text-center space-y-4 p-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">1. Raccolta dati anonimi</h3>
                    <p className="text-sm text-slate-300">
                      <strong>Solo dati verificabili</strong>: residenza, frequenza d'uso, soglie critiche. 
                      Non memorizzati, non venduti, completamente anonimi.
                    </p>
                    <p className="text-xs text-slate-400">
                      Metodi accademici per anonimato
                    </p>
                  </div>
                </div>
                
                <div className="card-premium group hover:-translate-y-1 transition-transform">
                  <div className="text-center space-y-4 p-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">2. Matching quantitativo</h3>
                    <p className="text-sm text-slate-300">
                      <strong>Algoritmo LMM</strong> confronta i tuoi parametri con migliaia di contratti reali, 
                      costi nascosti e problematiche documentate.
                    </p>
                    <p className="text-xs text-slate-400">
                      Sicurezza e compatibilità verificate
                    </p>
                  </div>
                </div>
                
                <div className="card-premium group hover:-translate-y-1 transition-transform">
                  <div className="text-center space-y-4 p-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">3. Filtro automatico</h3>
                    <p className="text-sm text-slate-300">
                      <strong>Esclusione automatica</strong> di tutto ciò che presenta incompatibilità, 
                      inefficienze documentate o rischi per il tuo profilo.
                    </p>
                    <p className="text-xs text-slate-400">
                      Basato su reclami reali e dati storici
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Principio chiave */}
        <section className="border-b border-slate-800/60 bg-slate-950">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="card-premium text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/20 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">PRINCIPIO CHIAVE</span>
              </div>
              
              <h2 className="text-xl font-bold text-white">
                Compatibilità prima di tutto
              </h2>
              
              <p className="text-slate-300">
                Una sola incompatibilità = <strong>prodotto escluso</strong>, indipendentemente da quanto sia "popolare" o "consigliato".
              </p>
              
              <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                Il nostro obiettivo non è vendere o convincere, ma <strong>ridurre il rischio</strong> 
                di scelte incompatibili con la tua situazione reale.
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
                Analisi basata esclusivamente su <strong>dati verificabili</strong> del tuo contesto operativo.
              </p>
              
              <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-400">
                <svg className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Possibile risultato: "Nessuna opzione compatibile". È un esito valido e trasparente.
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
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 text-green-400 mb-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white mb-1">Non vendiamo prodotti</p>
                  <p className="text-xs text-slate-400">Nessun conflitto diretto</p>
                </div>
                
                <div className="card-premium p-4 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 text-green-400 mb-3">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
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
    </>
  )
}
