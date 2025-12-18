'use client'

import { Logo } from '@/components/ui/Logo'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Clean academic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Logo */}
        <AnimatedSection delay={0}>
          <div className="flex justify-center mb-8 sm:mb-12">
            <Logo size="lg" />
          </div>
        </AnimatedSection>

        {/* Main headline */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight text-center">
            <span className="text-slate-100 block">Sistema indipendente che ti evita di</span>
            <span className="text-gradient font-serif font-medium block mt-2">scegliere il servizio sbagliato</span>
            <span className="text-slate-300 text-2xl sm:text-3xl md:text-4xl block mt-2">per tenere, muovere o usare i tuoi soldi</span>
          </h1>
        </div>
        
        {/* Sub-headline */}
        <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
          <p className="text-lg sm:text-xl text-slate-300 mb-4 leading-relaxed px-4 sm:px-0 text-center">
            Un controllo in più prima di affidare i tuoi soldi a un servizio.
          </p>
        </div>

        {/* CTA Button */}
        <div className="mb-12 sm:mb-16 text-center">
          <button className="btn-primary text-base sm:text-lg">
            Verifica prima di scegliere
          </button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-sm text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
            <span className="font-medium">Indipendente</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
            <span className="font-medium">Neutrale</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
            <span className="font-medium">Trasparente</span>
          </div>
        </div>
      </div>
    </section>
  )
}