'use client'

import Link from 'next/link'
import { LogoMark } from '@/components/site/LogoMark'
import { useEffect, useState } from 'react'

// Hook per intersection observer
function useInView(threshold = 0.1) {
  const [ref, setRef] = useState<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref) return
    
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    )
    
    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref, threshold])

  return [setRef, inView] as const
}

// Hook per scroll progress
function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setProgress((scrolled / maxScroll) * 100)
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  return progress
}

function CompatibilityHeader() {
  const progress = useScrollProgress()
  
  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-900">
        <div 
          className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="group flex items-center gap-2 text-lg font-semibold tracking-tight text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/50 p-1.5 ring-1 ring-slate-800/60 transition-all duration-300 group-hover:ring-red-500/50">
              <LogoMark className="h-full w-full transition-transform duration-300 group-hover:scale-110" />
            </span>
            <span className="leading-none">Tradelia</span>
            <span className="text-sm text-slate-400">Compatibility Analysis</span>
          </div>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Navigazione compatibility">
            <Link
              href="#rischi"
              className="text-sm font-semibold text-slate-100 transition-all duration-200 hover:text-white hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Rischi
            </Link>
            <Link
              href="#costi"
              className="text-sm font-semibold text-slate-100 transition-all duration-200 hover:text-white hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Costi Nascosti
            </Link>
            <Link
              href="#verifica"
              className="text-sm font-semibold text-slate-100 transition-all duration-200 hover:text-white hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Verifica
            </Link>
          </nav>
        </div>
      </header>
    </>
  )
}

export default function CompatibilityPage() {
  const [heroRef, heroInView] = useInView(0.3)
  const [problemRef, problemInView] = useInView(0.2)
  const [evidenceRef, evidenceInView] = useInView(0.2)
  const [solutionRef, solutionInView] = useInView(0.2)
  const [ctaRef, ctaInView] = useInView(0.3)
  const [socialProof, setSocialProof] = useState(1247)
  
  // Animate social proof counter
  useEffect(() => {
    const interval = setInterval(() => {
      setSocialProof(prev => prev + Math.floor(Math.random() * 3))
    }, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  // Exit-intent detection
  useEffect(() => {
    let exitIntentShown = false
    
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentShown && window.innerWidth > 768) {
        exitIntentShown = true
        const popup = document.getElementById('exit-intent-popup')
        if (popup) {
          popup.classList.remove('hidden')
          popup.classList.add('flex')
        }
      }
    }
    
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [])
  
  return (
    <>
      <CompatibilityHeader />
      <main id="contenuto-principale" className="relative">
        {/* Hero focalizzato su rischi */}
        <section ref={heroRef} className={`relative overflow-hidden bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 transition-all duration-1000 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          
          <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm font-medium text-red-100 animate-pulse">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                <span className="animate-none">Risk Prevention</span>
              </div>
              
              <h1 className={`text-4xl font-bold tracking-tight text-white sm:text-5xl transition-all duration-700 delay-300 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Evita costi nascosti
                <span className="block text-gradient mt-2">e rischi operativi</span>
              </h1>
              
              <p className={`mx-auto max-w-2xl text-lg text-slate-300 transition-all duration-700 delay-500 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Verifichiamo <strong>incompatibilità prima che ti costino denaro</strong>. Analisi basata su contratti reali e reclami documentati.
              </p>
              
              {/* Risk stats */}
              <div className={`inline-flex items-center gap-2 text-sm text-red-400 transition-all duration-700 delay-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>€2.300 costo medio annuo per incompatibilità non rilevate</span>
              </div>
              
              <div className={`flex flex-col gap-3 sm:flex-row sm:justify-center transition-all duration-700 delay-900 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <Link href="#verifica" className="btn-primary group bg-red-600 hover:bg-red-700">
                  <span>Verifica compatibilità ora</span>
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="#costi" className="btn-secondary group">
                  <span>Vedi costi nascosti</span>
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Rischi reali con dati */}
        <section id="rischi" className="border-b border-slate-800/60 bg-slate-950">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Cosa rischi scegliendo male
              </h2>
              <p className="text-lg text-slate-300">
                Dati reali da <strong>8.500 reclami analizzati</strong> (Banca d'Italia, CONSOB)
              </p>
              
              {/* Costi medi */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="card-premium p-4 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-red-400">€2.300</p>
                    <p className="text-sm text-slate-300">Costo medio annuo</p>
                    <p className="text-xs text-slate-400">Incompatibilità non rilevate</p>
                  </div>
                </div>
                
                <div className="card-premium p-4 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-orange-400">€850</p>
                    <p className="text-sm text-slate-300">Commissioni nascoste</p>
                    <p className="text-xs text-slate-400">Scoperte dopo 6 mesi</p>
                  </div>
                </div>
                
                <div className="card-premium p-4 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-yellow-400">€1.200</p>
                    <p className="text-sm text-slate-300">Penali uscita</p>
                    <p className="text-xs text-slate-400">Non dichiarate</p>
                  </div>
                </div>
                
                <div className="card-premium p-4 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-red-400">45</p>
                    <p className="text-sm text-slate-300">Giorni medi</p>
                    <p className="text-xs text-slate-400">Risoluzione problemi</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-left space-y-3">
                <h3 className="text-lg font-semibold text-red-400">Il problema vero</h3>
                <p className="text-slate-300">
                  Questi costi emergono solo in situazioni critiche: emergenze, viaggi, contestazioni. 
                  I comparatori non li considerano perché <strong>non sono misurabili con metriche di marketing</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Costi nascosti comuni */}
        <section id="costi" className="border-b border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-orange-400" />
                <span className="text-sm font-semibold text-orange-400">COSTI NASCOSTI</span>
              </div>
              
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Commissioni che scopri dopo
              </h2>
              
              <p className="text-lg text-slate-300 max-w-3xl mx-auto">
                Costi reali estratti da contratti verificati. Non teorici, ma <strong>quelli che paghi davvero</strong>.
              </p>
              
              {/* Lista costi */}
              <div className="grid gap-4 text-left">
                <div className="card-premium p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Commissioni estero</p>
                    <p className="text-sm text-slate-400">Per operazione + cambio valuta</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-400">€2 - €15</p>
                    <p className="text-xs text-slate-400">+ 1-4% cambio</p>
                  </div>
                </div>
                
                <div className="card-premium p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Superamento soglie</p>
                    <p className="text-sm text-slate-400">Oltre limiti mensili/annuali</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-400">fino 3%</p>
                    <p className="text-xs text-slate-400">dell'importo</p>
                  </div>
                </div>
                
                <div className="card-premium p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Inattività conto</p>
                    <p className="text-sm text-slate-400">Dopo 6-12 mesi senza operazioni</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-400">€5-25</p>
                    <p className="text-xs text-slate-400">al mese</p>
                  </div>
                </div>
                
                <div className="card-premium p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Cambio residenza</p>
                    <p className="text-sm text-slate-400">Chiusura forzata + penali</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-400">€50-500</p>
                    <p className="text-xs text-slate-400">+ chiusura</p>
                  </div>
                </div>
                
                <div className="card-premium p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Assistenza telefonica</p>
                    <p className="text-sm text-slate-400">Supporto umano a pagamento</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-400">€2-8</p>
                    <p className="text-xs text-slate-400">per chiamata</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-4 text-left space-y-3">
                <h3 className="text-base font-semibold text-white">Perché non li vedi prima</h3>
                <p className="text-sm text-slate-300">
                  Questi costi sono sepolti nei contratti, attivati solo in situazioni specifiche, 
                  o comunicati con terminologia tecnica. I comparatori li ignorano perché <strong>non fanno parte del marketing</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="come-funziona" className="border-b border-slate-800/60 bg-gradient-to-br from-slate-950 to-slate-900">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Come evitiamo questi costi
              </h2>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto">
                Database proprietario di <strong>12.000+ contratti completi verificati</strong> 
                con analisi automatica di incompatibilità.
              </p>
              
              {/* Infrastruttura dati */}
              <div className="card-premium p-6 text-left space-y-4 mb-8">
                <h3 className="text-lg font-semibold text-white text-center">Database di verifica</h3>
                <div className="grid gap-4 md:grid-cols-3 text-center">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-green-400">12.000+</div>
                    <p className="text-sm text-slate-300">Contratti completi verificati</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-orange-400">8.500+</div>
                    <p className="text-sm text-slate-300">Reclami reali analizzati</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-red-400">2.300+</div>
                    <p className="text-sm text-slate-300">Incompatibilità documentate</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 text-center">
                  Algoritmo che confronta il tuo profilo con questa base di conoscenza per escludere rischi.
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="card-premium group hover:-translate-y-1 transition-transform">
                  <div className="text-center space-y-4 p-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">1. Profilo operativo</h3>
                    <p className="text-sm text-slate-300">
                      <strong>Dati verificabili</strong>: residenza, frequenza d'uso, soglie operative. 
                      Anonimi, non memorizzati.
                    </p>
                  </div>
                </div>
                
                <div className="card-premium group hover:-translate-y-1 transition-transform">
                  <div className="text-center space-y-4 p-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">2. Verifica automatica</h3>
                    <p className="text-sm text-slate-300">
                      <strong>Confronto con database</strong> di contratti reali, 
                      costi nascosti e reclami documentati.
                    </p>
                  </div>
                </div>
                
                <div className="card-premium group hover:-translate-y-1 transition-transform">
                  <div className="text-center space-y-4 p-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">3. Esclusione rischi</h3>
                    <p className="text-sm text-slate-300">
                      <strong>Filtro automatico</strong> di incompatibilità, 
                      costi nascosti e rischi per il tuo profilo.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Risultato</h3>
                <p className="text-slate-300">
                  Solo strumenti <strong>verificati compatibili</strong> con il tuo caso specifico. 
                  Incompatibilità evidenziate e spiegate.
                </p>
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

        {/* CTA principale */}
        <section id="verifica" className="border-b border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-950">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="card-premium text-center space-y-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20">
                <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-white">
                Verifica compatibilità ora
              </h2>
              
              <p className="text-slate-300 max-w-xl mx-auto">
                Evita <strong>costi nascosti e incompatibilità</strong> prima che ti costino denaro.
              </p>
              
              <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-400">
                <svg className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Analisi gratuita • 3 minuti • Dati non memorizzati
              </div>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="#procedi" className="btn-primary bg-red-600 hover:bg-red-700">
                  Avvia verifica gratuita
                </Link>
                <button onClick={() => alert('Popup Metodo - Coming Soon')} className="btn-secondary">
                  Come funziona
                </button>
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
              
              <button onClick={() => alert('Popup Trasparenza - Coming Soon')} className="link-ghost-sky inline-flex items-center gap-2">
                <span>Dettagli trasparenza</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Footer interno */}
        <section className="border-t border-slate-800/60 bg-slate-950 py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-slate-400 space-y-3">
              <p className="font-semibold text-white">Tradelia · Compatibility Analysis</p>
              <p>Verifica di compatibilità per strumenti finanziari</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="hover-link" onClick={() => alert('Popup Metodo - Coming Soon')}>Metodo</button>
                <button className="hover-link" onClick={() => alert('Popup Trasparenza - Coming Soon')}>Trasparenza</button>
                <button className="hover-link" onClick={() => alert('Popup Privacy - Coming Soon')}>Privacy</button>
                <button className="hover-link" onClick={() => alert('Popup Disclaimer - Coming Soon')}>Disclaimer</button>
              </div>
              <p className="text-xs">Informativo / educativo. Non è consulenza finanziaria.</p>
            </div>
          </div>
        </section>
      </main>
      
      {/* Sticky CTA Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-sm border-t border-slate-800/60 p-4 sm:hidden transform transition-transform duration-300">
        <Link 
          href="#verifica" 
          className="btn-primary w-full text-center group relative overflow-hidden bg-red-600 hover:bg-red-700"
          onClick={() => {
            // Haptic feedback per iOS
            if ('vibrate' in navigator) {
              navigator.vibrate(50)
            }
          }}
        >
          <span className="relative z-10">Verifica compatibilità ora</span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </Link>
      </div>
      
      {/* Exit-intent popup */}
      <div id="exit-intent-popup" className="fixed inset-0 z-50 hidden items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md mx-4 transform scale-95 transition-all duration-300">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Aspetta!</h3>
            <p className="text-slate-300">Non rischiare di scegliere il prodotto finanziario sbagliato. La nostra verifica è gratuita e richiede solo 3 minuti.</p>
            <div className="flex gap-3">
              <button className="btn-primary flex-1 bg-red-600 hover:bg-red-700" onClick={() => {
                document.getElementById('exit-intent-popup')?.classList.add('hidden')
                document.getElementById('verifica')?.scrollIntoView({ behavior: 'smooth' })
              }}>Verifica gratuita</button>
              <button className="btn-secondary" onClick={() => {
                document.getElementById('exit-intent-popup')?.classList.add('hidden')
              }}>Chiudi</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
