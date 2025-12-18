'use client'

import { Logo } from '@/components/ui/Logo'
import { useEffect, useState } from 'react'

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 grid-bg opacity-30"></div>
      <div className="absolute inset-0 section-pattern"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-10 w-20 h-20 border border-primary-500/20 rotate-45 animate-float"></div>
      <div className="absolute bottom-32 right-16 w-16 h-16 bg-primary-500/10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/3 right-20 w-12 h-12 border-2 border-primary-400/30 animate-float" style={{animationDelay: '4s'}}></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Logo */}
        <div className={`flex justify-center mb-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
          <Logo size="lg" className="glow-effect" />
        </div>

        {/* Main headline */}
        <h1 className={`text-5xl md:text-7xl font-bold mb-8 ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{animationDelay: '0.2s'}}>
          <span className="text-dark-100">Capisci il </span>
          <span className="text-gradient">rischio</span>
          <br />
          <span className="text-dark-100">del mercato cripto,</span>
          <br />
          <span className="text-primary-400 text-4xl md:text-5xl">prima di fare qualsiasi operazione.</span>
        </h1>
        
        {/* Sub-headline */}
        <p className={`text-xl md:text-2xl text-dark-300 mb-12 max-w-3xl mx-auto leading-relaxed ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{animationDelay: '0.4s'}}>
          Dati ufficiali in streaming + analisi contestuale.<br/>
          <span className="text-primary-400 font-medium">Nessun segnale. Nessuna promessa di profitto.</span>
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-6 justify-center mb-12 ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{animationDelay: '0.6s'}}>
          <button className="btn-primary text-lg px-10 py-4 glow-effect">
            <span className="flex items-center gap-3">
              <span>Vedi lo stato del mercato</span>
              <span className="bg-green-500 text-green-500 bg-opacity-20 px-2 py-1 rounded text-sm">GRATIS</span>
            </span>
          </button>
          <button className="btn-secondary text-lg px-10 py-4">
            Come funziona →
          </button>
        </div>

        {/* Compliance notice */}
        <div className={`inline-flex items-center gap-2 bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-full px-6 py-3 ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{animationDelay: '0.8s'}}>
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-dark-300">
            Educational only · High-risk market · No financial advice
          </span>
        </div>

        {/* Scroll indicator */}
        <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 ${mounted ? 'animate-bounce' : 'opacity-0'}`} style={{animationDelay: '1s'}}>
          <div className="w-6 h-10 border-2 border-primary-500/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary-500 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  )
}