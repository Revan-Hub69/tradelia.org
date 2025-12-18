'use client'

import { Logo } from '@/components/ui/Logo'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-950"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Logo size="lg" />
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-light mb-8 leading-tight">
          <span className="text-gradient font-extralight">Evidence-Based</span>
          <br />
          <span className="text-slate-300 text-4xl md:text-6xl font-light">Crypto Analysis</span>
        </h1>
        
        {/* Sub-headline */}
        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-xl text-slate-300 mb-6 font-light leading-relaxed">
            Crypto intelligence, not noise: metriche + spiegazione guidata del "perché", con incertezza e limiti.
          </p>
          <p className="text-slate-500 text-lg italic">
            We explain, you decide.
          </p>
        </div>

        {/* Visual: noise → method → insight */}
        <div className="flex items-center justify-center gap-8 mb-12 text-slate-400">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">📊</span>
            </div>
            <span className="text-sm">Noise</span>
          </div>
          <div className="text-slate-600">→</div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">🧠</span>
            </div>
            <span className="text-sm">Method</span>
          </div>
          <div className="text-slate-600">→</div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">💡</span>
            </div>
            <span className="text-sm">Insight</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button className="btn-primary">
            Analyze Current Market
          </button>
          <button className="btn-secondary">
            See Methodology
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