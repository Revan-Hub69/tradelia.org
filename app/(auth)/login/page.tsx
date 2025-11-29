'use client';

import { AuthForm } from '@/components/auth/AuthForm';
import { BookOpen, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Animated background gradients - matching homepage style */}
      <motion.div
        className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-accent/20 via-accent/5 to-transparent rounded-full blur-[90px]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute -bottom-1/3 -left-1/10 w-[650px] h-[650px] bg-gradient-to-br from-accent/10 via-transparent to-transparent rounded-full blur-[80px]"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden="true"
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(37, 99, 235, 0.25) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-12 items-center">
          {/* Left side - Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-accent border border-border-accent flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-accent" aria-hidden="true" />
                </div>
                <p className="text-xs uppercase tracking-[0.4em] text-text-tertiary font-semibold">
                  Formazione Finanziaria
                </p>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter text-text-primary">
                Accedi alla tua{' '}
                <span className="gradient-text">dashboard</span>
              </h1>
              
              <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl font-light">
                Esplora percorsi formativi completi, consulta report pubblici verificabili, 
                accedi ai framework AI documentati e gestisci le tue richieste di analisi. 
                Tutto gratuito, aperto e conforme agli standard accademici.
              </p>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
              <div className="rounded-2xl border border-border-subtle/60 bg-bg-surface/60 backdrop-blur-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center">
                    <Shield className="w-5 h-5 text-accent" aria-hidden="true" />
                  </div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-text-tertiary font-semibold">
                    Metodo verificabile
                  </dt>
                </div>
                <dd className="text-text-primary text-base font-medium leading-relaxed">
                  Ogni framework è documentato con note metodologiche e dataset pubblici
                </dd>
              </div>
              
              <div className="rounded-2xl border border-border-subtle/60 bg-bg-surface/60 backdrop-blur-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center">
                    <Zap className="w-5 h-5 text-accent" aria-hidden="true" />
                  </div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-text-tertiary font-semibold">
                    Accesso libero
                  </dt>
                </div>
                <dd className="text-text-primary text-base font-medium leading-relaxed">
                  Percorsi formativi e report sempre gratuiti, servizi pro opzionali
                </dd>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border-subtle">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-accent" aria-hidden="true" />
                <span>Conforme MiFID II</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-accent" aria-hidden="true" />
                <span>GDPR compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-accent" aria-hidden="true" />
                <span>Open source</span>
              </div>
            </div>
          </motion.div>

          {/* Right side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <AuthForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
