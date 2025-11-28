'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, BookOpen, Shield, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useReducedMotion,
  createContainerVariants,
  createItemVariants,
  createHoverVariants,
} from '@/lib/animations';

const features = [
  {
    icon: CheckCircle2,
    title: 'Metodo documentato',
    description:
      'Ogni framework AI è accompagnato da note metodologiche, dataset citati e soglie di affidabilità dichiarate.',
  },
  {
    icon: BookOpen,
    title: 'Percorso indipendente',
    description:
      'Laboratorio aperto, gratuito e modulare: aggiorniamo i contenuti seguendo paper, norme e feedback della community.',
  },
  {
    icon: Shield,
    title: 'Trasparenza legale',
    description:
      'Materiale educativo conforme alle normative europee; nessuna consulenza, solo ricerca e strumenti didattici.',
  },
  {
    icon: Zap,
    title: 'Servizi pro opzionali',
    description:
      'Report, analisi on demand e dashboard premium per chi vuole integrare i nostri modelli nel proprio lavoro.',
  },
];

export function Features() {
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = createContainerVariants(prefersReducedMotion);
  const itemVariants = createItemVariants(prefersReducedMotion);
  const hoverVariants = createHoverVariants(prefersReducedMotion);

  return (
    <section 
      className="relative py-24 md:py-32 bg-bg-surface overflow-hidden"
      aria-labelledby="features-title"
    >
      {/* Subtle background pattern */}
      <div className="geometric-pattern" aria-hidden="true" />

      {/* Subtle gradient accent */}
      <motion.div
        className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-accent/6 to-transparent rounded-full blur-[60px]"
        animate={
          prefersReducedMotion
            ? {}
            : {
                scale: [1, 1.05, 1],
                opacity: [0.4, 0.5, 0.4],
              }
        }
        transition={
          prefersReducedMotion
            ? {}
            : {
                duration: 20,
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
        {/* Section Header */}
        <motion.div
          variants={itemVariants}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge variant="default" className="mb-6">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>Formazione</span>
          </Badge>
          <h2 id="features-title" className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tighter text-text-primary mb-6">
            Formazione Finanziaria di{' '}
            <span className="gradient-text">Livello Accademico</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed tracking-tight font-light">
            Percorsi formativi completi basati su{' '}
            <strong className="text-text-primary font-medium">
              framework AI proprietari verificabili
            </strong>{' '}
            e metodologie documentate. Conforme agli standard accademici internazionali e alle normative MiFID II.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div key={idx} variants={itemVariants}>
                <motion.div variants={hoverVariants} whileHover="hover" whileTap="tap">
                  <Card className="h-full hover:border-border-accent group">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-accent border border-border-accent flex items-center justify-center transition-colors duration-300 group-hover:bg-gradient-primary">
                          <Icon className="w-8 h-8 text-accent" aria-hidden="true" />
                        </div>
                        {/* Non-chromatic indicator for colorblind accessibility */}
                        <div className="w-2 h-2 rounded-full bg-accent border border-accent" aria-hidden="true" />
                      </div>
                      <CardTitle className="text-xl font-bold text-text-primary" id={`feature-title-${idx}`}>
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-text-secondary leading-relaxed font-light" aria-describedby={`feature-title-${idx}`}>
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div variants={itemVariants} className="text-center">
          <motion.div variants={hoverVariants} whileHover="hover" whileTap="tap">
            <Button asChild variant="default" size="lg">
              <Link href="/dashboard#education">
                <span>Esplora i Percorsi Formativi</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
