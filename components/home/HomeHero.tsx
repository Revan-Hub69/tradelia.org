'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function HomeHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-bg-base py-24 md:py-32">
      {/* Animated background gradients */}
      <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-[60px] animate-float" />
      <div className="absolute -bottom-1/3 -left-1/10 w-[600px] h-[600px] bg-gradient-to-br from-accent-blue/8 to-transparent rounded-full blur-[50px] animate-float [animation-direction:reverse]" />
      
      {/* Geometric pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(255,255,255,0.015)_1px,rgba(255,255,255,0.015)_2px),repeating-linear-gradient(90deg,transparent,transparent_1px,rgba(255,255,255,0.015)_1px,rgba(255,255,255,0.015)_2px)] bg-[length:40px_40px] animate-pattern-shift" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(0,188,212,0.03)_0%,transparent_40%),radial-gradient(circle_at_85%_75%,rgba(0,115,230,0.025)_0%,transparent_40%),radial-gradient(circle_at_50%_50%,rgba(0,188,212,0.015)_0%,transparent_60%)] animate-pattern-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 text-center">
        {/* Badge */}
        <div className="animate-fade-in-up mb-12">
          <Badge variant="default" className="mb-8">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:rotate-5 group-hover:scale-110">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Formazione Finanziaria</span>
          </Badge>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tighter text-text-primary mb-6 max-w-5xl mx-auto animate-fade-in-up [animation-delay:0.2s] [animation-fill-mode:both] drop-shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
          Formazione finanziaria gratuita basata su{' '}
          <span className="bg-gradient-primary bg-clip-text text-transparent relative inline-block">
            framework verificabili
            <span className="absolute bottom-0.1 left-0 w-full h-[0.15em] bg-gradient-primary opacity-20 rounded-sm animate-underline-expand [animation-delay:1s] [animation-fill-mode:both]" />
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-text-secondary mb-10 max-w-3xl mx-auto animate-fade-in-up [animation-delay:0.4s] [animation-fill-mode:both] tracking-tight">
          Percorsi formativi completi, metodologie documentate e materiale didattico conforme agli standard accademici internazionali.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 mb-12 max-w-3xl mx-auto py-12 border-y border-border relative animate-fade-in-up [animation-delay:0.6s] [animation-fill-mode:both]">
          <div className="before:absolute before:top-1/2 before:left-0 before:right-0 before:h-px before:bg-gradient-primary before:opacity-10 before:-translate-y-1/2" />
          {[
            { value: '100%', label: 'Gratuito' },
            { value: '3', label: 'Framework AI' },
            { value: '∞', label: 'Accesso Ilimitato' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-3 group transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-primary bg-clip-text text-transparent leading-none tracking-tighter transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_20px_rgba(0,188,212,0.4)]">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-widest transition-colors duration-300 group-hover:text-text-secondary">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up [animation-delay:0.8s] [animation-fill-mode:both]">
          <Button asChild variant="primary" size="lg" className="group">
            <Link href="/dashboard#education">
              <span>Inizia la Formazione</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="group">
            <Link href="/dashboard">
              <span>Dashboard</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:rotate-90">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </Link>
          </Button>
        </div>

        {/* Disclaimer */}
        <Card variant="gradient" className="max-w-4xl mx-auto text-left animate-fade-in-up [animation-delay:1s] [animation-fill-mode:both]">
          <div className="flex items-start gap-5 p-6 md:p-8">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent flex-shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(0,188,212,0.4)]">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed tracking-tight m-0">
              Le informazioni fornite sono a scopo educativo e non costituiscono consulenza finanziaria.
              Materiale conforme alle regole MiFID II e agli standard accademici internazionali.
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
