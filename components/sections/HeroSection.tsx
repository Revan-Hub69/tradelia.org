'use client'

import { Logo } from '@/components/ui/Logo'
import { GeometricPattern } from '@/components/ui/GeometricPattern'
import { AnimatedSection } from '@/components/ui/AnimatedSection'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with patterns */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-950"></div>
      <GeometricPattern variant="dots" className="opacity-40" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Logo */}
        <AnimatedSection delay={0}>
          <div className="flex justify-center mb-8 sm:mb-12">
            <Logo size="lg" />
          </div>
        </AnimatedSection>

        {/* Main headline */}
        <AnimatedSection delay={200}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-6 sm:mb-8 leading-tight">
            <span className="text-slate-200 block sm:inline">Sistema indipendente che ti evita di</span>
            <br className="hidden sm:block" />
            <span className="text-gradient font-medium block sm:inline">scegliere il servizio sbagliato</span>
            <br className="hidden sm:block" />
            <span className="text-slate-300 text-2xl sm:text-3xl md:text-4xl block sm:inline">per tenere, muovere o usare i tuoi soldi</span>
          </h1>
        </AnimatedSection>
        
        {/* Sub-headline */}
        <AnimatedSection delay={400}>
          <div className="max-w-2xl mx-auto mb-8 sm:mb-12">
            <p className="text-lg sm:text-xl text-slate-400 mb-4 leading-relaxed px-4 sm:px-0">
              Un controllo in più prima di affidare i tuoi soldi a un servizio.
            </p>
          </div>
        </AnimatedSection>

        {/* CTA Button */}
        <AnimatedSection delay={600}>
          <div className="mb-12 sm:mb-16">
            <button className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto max-w-sm sm:max-w-none mx-auto transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              Verifica prima di scegliere
            </button>
          </div>
        </AnimatedSection>

        {/* Trust indicators */}
        <AnimatedSection delay={800}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2 group">
              <div className="w-2 h-2 bg-green-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="group-hover:text-slate-400 transition-colors duration-300">Indipendente</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="w-2 h-2 bg-blue-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="group-hover:text-slate-400 transition-colors duration-300">Neutrale</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="w-2 h-2 bg-purple-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="group-hover:text-slate-400 transition-colors duration-300">Trasparente</span>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}