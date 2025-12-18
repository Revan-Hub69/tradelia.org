'use client'

import { Logo } from '@/components/ui/Logo'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grid-pattern">
      {/* Subtle background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-950"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Logo size="lg" />
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-light mb-8 leading-tight">
          <span className="text-gradient font-extralight">Capisci il rischio</span>
          <br />
          <span className="text-slate-400 text-4xl md:text-5xl font-light">del mercato cripto,</span>
          <br />
          <span className="text-accent font-medium text-3xl md:text-4xl">prima di operare</span>
        </h1>
        
        {/* Sub-headline */}
        <div className="max-w-2xl mx-auto mb-12">
          <p className="text-xl text-slate-300 mb-4 font-light leading-relaxed">
            Analisi quantitativa in tempo reale basata su dati istituzionali
          </p>
          <p className="text-slate-500 text-lg">
            Nessun segnale • Nessuna promessa di profitto • Solo contesto
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button className="btn-primary">
            Accedi al Dashboard
          </button>
          <button className="btn-secondary">
            Scopri la metodologia
          </button>
        </div>

        {/* Compliance notice */}
        <div className="inline-flex items-center gap-3 bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-full px-6 py-3">
          <div className="w-2 h-2 bg-amber-400 rounded-full opacity-60"></div>
          <span className="text-sm text-slate-400 font-light">
            Educational only • High-risk market • No financial advice
          </span>
        </div>
      </div>
    </section>
  )
}