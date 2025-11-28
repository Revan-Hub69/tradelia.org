'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, Grid3x3, CircleDot, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const methods = [
  {
    id: 'fdm',
    acronym: 'FDM',
    title: 'Framework Dinamico dei Mercati',
    description:
      'Analisi contesto macro con controlli incrociati multiformato e aggiornamenti dinamici in tempo reale. Metodologia verificabile e documentata.',
    features: [
      'Analisi contesto macro',
      'Controlli incrociati multiformato',
      'Aggiornamenti dinamici',
    ],
    icon: TrendingUp,
    color: 'from-accent to-accent-hover',
  },
  {
    id: 'mlt',
    acronym: 'MLT',
    title: 'Matrice delle Letture Tattiche',
    description:
      'Analisi intermarket con correlazioni cross-asset e segnali tattici per decisioni informate. Framework documentato con fonti verificabili.',
    features: [
      'Analisi intermarket',
      'Correlazioni cross-asset',
      'Segnali tattici',
    ],
    icon: Grid3x3,
    color: 'from-accent-hover to-accent-active',
  },
  {
    id: 'pac',
    acronym: 'PAC',
    title: 'Protocollo di Allerta Criptovalute',
    description:
      'Monitoraggio cripto con alert automatizzati e analisi rischio per gestione consapevole. Metodologia trasparente e verificabile.',
    features: [
      'Monitoraggio cripto',
      'Alert automatizzati',
      'Analisi rischio',
    ],
    icon: CircleDot,
    color: 'from-accent to-accent-active',
  },
];

export function Methods() {
  return (
    <section className="relative py-24 md:py-32 bg-bg-base overflow-hidden">
      {/* Subtle background pattern */}
      <div className="geometric-pattern" />

      {/* Subtle gradient accent */}
      <div className="absolute bottom-10 left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-accent/5 to-transparent rounded-full blur-[70px]" />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        {/* Section Header */}
        <motion.div
          variants={itemVariants}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge variant="default" className="mb-6">
            <Grid3x3 className="w-4 h-4" />
            <span>Framework AI Proprietari</span>
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tighter text-text-primary mb-6">
            Metodologie{' '}
            <span className="gradient-text">Verificabili e Documentate</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed tracking-tight font-light">
            Framework AI proprietari per approfondimenti multiformato su contesto macro, intermarket e tecnico con{' '}
            <strong className="text-text-primary font-medium">
              controlli incrociati verificabili
            </strong>{' '}
            e documentazione completa delle fonti, ipotesi e limiti metodologici.
          </p>
        </motion.div>

        {/* Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {methods.map((method, idx) => {
            const Icon = method.icon;
            return (
              <motion.div key={method.id} variants={itemVariants}>
                <Card className="h-full group">
                  <CardHeader>
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${method.color} border border-border-accent flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-glow`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold gradient-text uppercase tracking-widest mb-1">
                          {method.acronym}
                        </div>
                        <CardTitle className="text-xl font-bold text-text-primary leading-tight">
                          {method.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-text-secondary leading-relaxed mb-6 font-light">
                      {method.description}
                    </CardDescription>
                    <ul className="space-y-3 mb-6">
                      {method.features.map((feature, featureIdx) => (
                        <li
                          key={featureIdx}
                          className="flex items-center gap-3 text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-300"
                        >
                          <Check className="w-4 h-4 text-accent flex-shrink-0" />
                          <span className="font-light">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/dashboard#education"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover transition-colors duration-300 group/link"
                    >
                      <span>Esplora Framework</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
