'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const createVariants = (prefersReducedMotion: boolean) => ({
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion
        ? {}
        : {
            staggerChildren: 0.1,
            delayChildren: 0.2,
          },
    },
  },
  item: {
    hidden: prefersReducedMotion ? {} : { opacity: 0, y: 30 },
    visible: prefersReducedMotion
      ? {}
      : {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          },
        },
  },
});

const floatVariants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export function Hero() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const stats = [
    { value: '100%', label: 'Gratuito', delay: 0.4 },
    { value: '3', label: 'Framework AI', delay: 0.5 },
    { value: '∞', label: 'Accesso Ilimitato', delay: 0.6 },
  ];

  const gradientAnimation = prefersReducedMotion
    ? {}
    : {
        scale: [1, 1.08, 1],
        opacity: [0.4, 0.6, 0.4],
      };

  const gradientTransition = prefersReducedMotion
    ? {}
    : {
        duration: 25,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      };

  const gradientAnimation2 = prefersReducedMotion
    ? {}
    : {
        scale: [1, 1.12, 1],
        opacity: [0.35, 0.55, 0.35],
      };

  const gradientTransition2 = prefersReducedMotion
    ? {}
    : {
        duration: 20,
        repeat: Infinity,
        ease: 'easeInOut' as const,
        delay: 0.5,
      };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-bg-base py-24 md:py-32">
      {/* Animated background gradients - Academic and refined */}
      <motion.div
        className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-accent/8 via-accent/5 to-transparent rounded-full blur-[80px]"
        animate={gradientAnimation}
        transition={gradientTransition}
        aria-hidden="true"
      />
      <motion.div
        className="absolute -bottom-1/3 -left-1/10 w-[600px] h-[600px] bg-gradient-to-br from-accent/6 via-accent-muted/4 to-transparent rounded-full blur-[70px]"
        animate={gradientAnimation2}
        transition={gradientTransition2}
        aria-hidden="true"
      />

      {/* Geometric pattern - Academic and refined */}
      <div className="geometric-pattern" aria-hidden="true" />
      
      {/* Additional geometric accents for depth */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 opacity-[0.03] pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 border border-border-subtle rounded-full" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      </div>
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 opacity-[0.02] pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 border border-border-subtle" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }} />
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-8 text-center"
        variants={createVariants(prefersReducedMotion).container}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={createVariants(prefersReducedMotion).item}>
          <Badge variant="default" className="mb-8 group">
            <BookOpen className="w-4 h-4 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" />
            <span>Formazione Finanziaria</span>
          </Badge>
        </motion.div>

        {/* Title - Academic and authoritative */}
        <motion.h1
          variants={createVariants(prefersReducedMotion).item}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tighter text-text-primary mb-6 max-w-5xl mx-auto drop-shadow-[0_2px_20px_rgba(0,0,0,0.3)]"
        >
          Formazione finanziaria gratuita basata su{' '}
          <span className="gradient-text relative inline-block">
            framework verificabili
            {!prefersReducedMotion && (
              <motion.span
                className="absolute bottom-0.1 left-0 h-[0.15em] bg-gradient-primary opacity-20 rounded-sm"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 1.2, ease: 'easeOut' }}
              />
            )}
          </span>
        </motion.h1>

        {/* Description - Professional and clear */}
        <motion.p
          variants={createVariants(prefersReducedMotion).item}
          className="text-lg md:text-xl lg:text-2xl leading-relaxed text-text-secondary mb-10 max-w-3xl mx-auto tracking-tight font-light"
        >
          Percorsi formativi completi, metodologie documentate e materiale didattico conforme agli standard accademici internazionali.
        </motion.p>

        {/* Stats - Data-driven and elegant */}
        <motion.div
          variants={createVariants(prefersReducedMotion).item}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 mb-12 max-w-3xl mx-auto py-12 border-y border-border-subtle relative"
        >
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-primary opacity-5 -translate-y-1/2" />
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              className="flex flex-col gap-3 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay, duration: 0.6 }}
              whileHover={{ y: -4 }}
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold gradient-text leading-none tracking-tighter transition-smooth group-hover:scale-105 group-hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-widest transition-smooth group-hover:text-text-secondary">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons - Professional and clear */}
        <motion.div
          variants={createVariants(prefersReducedMotion).item}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Button asChild variant="default" size="lg" className="group">
            <Link href="/dashboard#education">
              <span>Inizia la Formazione</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="group">
            <Link href="/dashboard">
              <span>Dashboard</span>
              <LayoutDashboard className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
            </Link>
          </Button>
        </motion.div>

        {/* Disclaimer - Academic and compliant */}
        <motion.div variants={createVariants(prefersReducedMotion).item}>
          <Card variant="academic" className="max-w-4xl mx-auto text-left">
            <div className="flex items-start gap-5 p-6 md:p-8">
              <motion.div
                className="flex-shrink-0 mt-0.5"
                animate={prefersReducedMotion ? {} : floatVariants.animate}
              >
                <div className="w-5 h-5 rounded-full bg-accent-muted flex items-center justify-center ring-2 ring-accent/20">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                </div>
              </motion.div>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed tracking-tight m-0 font-light">
                Le informazioni fornite sono a scopo educativo e non costituiscono consulenza finanziaria.
                Materiale conforme alle regole <strong className="text-text-primary font-medium">MiFID II</strong> e agli standard accademici internazionali.
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </section>
  );
}
