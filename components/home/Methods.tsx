'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, Grid3x3, CircleDot, ArrowRight, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useReducedMotion,
  createContainerVariants,
  createItemVariants,
  createHoverVariants,
} from '@/lib/animations';

const methods = [
  {
    id: 'fdm',
    acronym: 'FDM',
    title: 'Framework Dinamico dei Mercati',
    description:
      'Raccoglie segnali macro, dati macroprudenziali e sentiment news per creare scenari di mercato apertamente documentati.',
    features: [
      'Stress test macro in tempo reale',
      'Dataset e fonti citati',
      'Versioning pubblico del modello',
    ],
    icon: TrendingUp,
    color: 'from-accent to-accent-hover',
  },
  {
    id: 'mlt',
    acronym: 'MLT',
    title: 'Matrice delle Letture Tattiche',
    description:
      'Matrix che unisce intermarket, spread e fattori di rischio per identificare segnali tattici replicabili.',
    features: [
      'Correlazioni cross-asset',
      'Alert tattici spiegati',
      'Soglie e limiti dichiarati',
    ],
    icon: Grid3x3,
    color: 'from-accent-hover to-accent-active',
  },
  {
    id: 'pac',
    acronym: 'PAC',
    title: 'Protocollo di Allerta Criptovalute',
    description:
      'Modulo cripto open-source: monitora on-chain, volatilità e liquidità per alert trasparenti sul rischio.',
    features: [
      'Indicatori on-chain documentati',
      'Alert configurabili',
      'Log pubblico degli aggiornamenti',
    ],
    icon: CircleDot,
    color: 'from-accent to-accent-active',
  },
];

export function Methods() {
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = createContainerVariants(prefersReducedMotion);
  const itemVariants = createItemVariants(prefersReducedMotion);
  const hoverVariants = createHoverVariants(prefersReducedMotion);

  return (
    <section className="relative py-24 md:py-32" aria-labelledby="methods-title">
      <div className="geometric-pattern" aria-hidden="true" />

      <motion.div
        className="absolute bottom-10 left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-accent/5 to-transparent rounded-full blur-[70px]"
        animate={
          prefersReducedMotion
            ? {}
            : {
                scale: [1, 1.08, 1],
                opacity: [0.3, 0.4, 0.3],
              }
        }
        transition={
          prefersReducedMotion
            ? {}
            : {
                duration: 25,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
        aria-hidden="true"
      />
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge variant="default" className="mb-6">
            <Grid3x3 className="w-4 h-4" aria-hidden="true" />
            <span>Framework AI + accademia</span>
          </Badge>
          <h2 id="methods-title" className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tighter text-text-primary mb-6">
            Metodologie{' '}
            <span className="gradient-text">aperte e replicabili</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed tracking-tight font-light">
            Ogni modulo è gratuito, versionato e corredato da note metodologiche.
            Puoi usarlo così com’è oppure espanderlo con servizi professionali opzionali.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {methods.map((method, idx) => {
            const Icon = method.icon;
            return (
              <motion.div key={method.id} variants={itemVariants}>
                <motion.div variants={hoverVariants} whileHover="hover" whileTap="tap">
                <Card className="h-full hover:border-border-accent group">
                  <CardHeader>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-accent-hover border border-border-accent flex items-center justify-center flex-shrink-0">
                          <Icon className="w-8 h-8 text-white" aria-hidden="true" />
                        </div>
                        <div
                          className={
                            idx === 0
                              ? 'w-3 h-3 rounded-full border-2 border-accent bg-accent'
                              : idx === 1
                              ? 'w-3 h-3 rotate-45 border-2 border-accent bg-accent'
                              : 'w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-accent'
                          }
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold gradient-text uppercase tracking-widest mb-1">
                          {method.acronym}
                        </div>
                        <CardTitle className="text-xl font-bold text-text-primary leading-tight" id={`method-title-${method.id}`}>
                          {method.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{method.description}</CardDescription>
                    <ul className="space-y-3 mb-6">
                      {method.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-3 text-sm text-text-secondary"
                        >
                          <Check className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
                          <span className="font-light">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/dashboard#education"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover transition-colors duration-200"
                    >
                      <span>Esplora Framework</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </CardContent>
                </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
