'use client'

import { Logo } from '@/components/ui/Logo'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-950"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Logo size="lg" />
        </div>

        {/* Main headline */}
        <h1 className="text-4xl md:text-6xl font-light mb-8 leading-tight">
          <span className="text-slate-200">Sistema indipendente che ti evita di</span>
          <br />
          <span className="text-gradient font-medium">scegliere il servizio sbagliato</span>
          <br />
          <span className="text-slate-300 text-3xl md:text-4xl">per tenere, muovere o usare i tuoi soldi</span>
        </h1>
        
        {/* Sub-headline */}
        <div className="max-w-2xl mx-auto mb-12">
          <p className="text-xl text-slate-400 mb-4 leading-relaxed">
            Un controllo in più prima di affidare i tuoi soldi a un servizio.
          </p>
        </div>

        {/* CTA Button */}
        <div className="mb-16">
          <button className="btn-primary text-lg px-8 py-4">
            Verifica prima di scegliere
          </button>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full opacity-60"></div>
            <span>Indipendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
            <span>Neutrale</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full opacity-60"></div>
            <span>Trasparente</span>
          </div>
        </div>
      </div>
    </section>
  )
}